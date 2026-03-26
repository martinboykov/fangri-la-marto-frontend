# Frontend: Examination

## Stack

| Concern | Technology |
|---|---|
| Framework | Angular 20 (standalone components, no NgModules) |
| UI Library | Ionic 8 (`@ionic/angular/standalone`) |
| Native Bridge | Capacitor 6 (App ID: `com.fangrila.app`) |
| HTTP | Angular `HttpClient` |
| State Management | Angular Signals (`signal()`, `computed()`) |
| Styling | Tailwind CSS v4 + Ionic CSS custom properties + global SCSS |
| Icons | Ionicons v7 |
| Testing | Karma + Jasmine |
| Build Tool | Angular CLI (`@angular-devkit/build-angular:application`) |
| Output Dir | `www/` |

---

## Entry Points

| File | Purpose |
|---|---|
| `src/main.ts` | `bootstrapApplication(AppComponent, appConfig)` — standalone bootstrap, no AppModule |
| `src/index.html` | Minimal shell; mobile viewport meta, PWA manifest link, theme-color `#000000` |
| `src/app/app.config.ts` | Global providers (see below) |
| `src/app/app.routes.ts` | Route definitions (all lazy-loaded) |

### Global Providers (`app.config.ts`)
1. `provideZoneChangeDetection({ eventCoalescing: true })` — coalesces CD events for performance
2. `provideRouter(routes, withPreloading(PreloadAllModules))` — eager-preloads all lazy chunks after initial load
3. `provideHttpClient(withInterceptors([authInterceptor]))` — registers JWT interceptor globally
4. `provideIonicAngular({ mode: 'ios' })` — forces iOS look-and-feel on all platforms

---

## Routing

All routes lazy-loaded via dynamic `import()`.

```
/                          → redirect to /tabs/collections
/tabs                      → HomePage (tab shell)
  /tabs/collections        → CollectionsPage
  /tabs/cart               → CartPage
  /tabs/profile            → ProfilePage
/product/:handle           → ProductDetailPage
/checkout                  → CheckoutPage
/auth                      → AuthPage (login + register)
/orders                    → OrdersPage
/orders/:id                → OrdersPage (same component, reads :id from route)
**                         → redirect to /tabs/collections
```

No route guards — auth gating is handled at the component level.

---

## State Management

All reactive state uses **Angular Signals**. No RxJS subjects for state storage; RxJS is used only in HTTP pipelines.

### `AuthService` (`src/app/core/services/auth.service.ts`)
- `_token = signal<string | null>(localStorage.getItem('fangrila_auth_token'))` — initialized from localStorage
- `isLoggedIn = computed(() => !!this._token())`
- `_customer = signal<Customer | null>(null)` — loaded on-demand via `loadProfile()`
- JWT stored in localStorage under key `fangrila_auth_token`

### `CartService` (`src/app/core/services/cart.service.ts`)
- `_cart = signal<Cart | null>(null)` — in-memory cart state
- `itemCount = computed(() => this._cart()?.totalQuantity ?? 0)` — drives tab bar badge
- `cartId = computed(...)` — resolves from signal or localStorage fallback
- Cart ID persisted in localStorage under key `fangrila_cart_id`
- `ensureCart()` lazy-creates or rehydrates cart from localStorage on first use
- All mutations (add/update/remove/buyer) use RxJS `switchMap` chains then call `_cart.set()` on success

### `ShopifyService` (`src/app/core/services/shopify.service.ts`)
- Stateless HTTP service — wraps every backend endpoint as a typed `HttpClient` method
- Defines all TypeScript interfaces: `Product`, `Collection`, `Cart`, `CartLine`, `Order`, `ProductVariant`, `ShopifyMoney`, `ProductBadge`
- `getBadges(product)` — pure function deriving badge metadata from product tags and metafields

---

## HTTP Interceptor

**`src/app/core/interceptors/auth.interceptor.ts`**

- Functional interceptor (`HttpInterceptorFn`) — injects `AuthService`, reads `token()` signal
- If a token exists, clones every outgoing request and attaches `Authorization: Bearer <token>`
- Registered globally via `withInterceptors([authInterceptor])` in `app.config.ts`

---

## Pages

All pages are standalone components with paired `.ts` + `.html` files.

| Page | Location | Key Behavior |
|---|---|---|
| **HomePage** | `pages/home/` | Tab shell; bottom tab bar with Shop / Cart (badge) / Account; loads cart on init |
| **CollectionsPage** | `pages/collections/` | Fetches `all` collection; signal-based `products[]`; cursor-based infinite scroll via `IonInfiniteScroll`; shows product badges |
| **ProductDetailPage** | `pages/product-detail/` | Signal for product + loading state; `computed` for `selectedVariant`; variant selector (hidden if 1 variant); sold-out awareness; Ionic Toast for add-to-cart feedback |
| **CartPage** | `pages/cart/` | Reads from `CartService.cart()` signal; +/- quantity controls; remove button; subtotal display; "Proceed to Checkout" |
| **CheckoutPage** | `pages/checkout/` | Shipping address form (`ngModel`); pre-fills name from customer signal; calls `cartBuyerIdentityUpdate`; opens Shopify hosted checkout via `@capacitor/browser`, falls back to `window.open` |
| **AuthPage** | `pages/auth/` | `IonSegment` tab switcher for Login/Register; mode tracked as signal; auto-login after registration |
| **ProfilePage** | `pages/profile/` | Shows "Sign In" prompt if not logged in; loads customer profile on init; links to Orders; Sign Out button |
| **OrdersPage** | `pages/orders/` | Lists orders from `ShopifyService.getOrders()`; fulfillment status badge with color coding; tapping an order navigates to `/orders/:id` (same component) |

---

## Styling

A hybrid of three systems:

1. **Ionic CSS** — core structure, normalize, typography, padding/flex utilities loaded via `angular.json`
2. **Tailwind CSS v4** — utility classes in templates; loaded via `@use "tailwindcss"` in `styles.scss` (CSS-first v4 API)
3. **Ionic CSS custom properties** — design token overrides in `:root` of `styles.scss`:
   - Primary: `#000000` (black)
   - Secondary: `#ffffff` (white)
   - Tertiary/Warning: `#f5c518` (gold/yellow)
   - Toolbar/tab bar: black background, white text
   - Four badge color variables: `--fangrila-badge-yellow`, `--fangrila-badge-dark`, `--fangrila-badge-teal`, `--fangrila-badge-pink`

### Badge System
- `ShopifyService.getBadges()` maps Shopify tags/metafields to typed `ProductBadge` objects
- Global `.badge.badge--{type}` SCSS classes defined in `styles.scss` (BEM modifiers: `yellow`, `dark`, `teal`, `pink`)
- Both `CollectionsPage` and `ProductDetailPage` use the same method and markup

### Dark Mode
`@media (prefers-color-scheme: dark)` block in `styles.scss` overrides background/text/light colors.

---

## PWA / Mobile Packaging

| File | Purpose |
|---|---|
| `public/manifest.webmanifest` | Standalone display, black theme, `Fangri-la` name, 512×512 icon |
| `capacitor.config.ts` | App ID `com.fangrila.app`; `webDir: 'www'`; Android HTTPS scheme; Browser plugin |

- `android.scheme: 'https'` ensures Capacitor's in-app browser works correctly with Shopify checkout URLs

---

## Static Server (`server.js`)

Minimal Express static server for Railway deployment:
- Serves `www/` with 1-year cache headers
- SPA fallback: all unmatched routes return `index.html`
- Not Angular SSR

---

## Key Config Files

| File | Notes |
|---|---|
| `package.json` | Angular 20, Ionic 8, Capacitor 6, Tailwind CSS 4; Karma/Jasmine for testing |
| `tsconfig.json` | Target ES2022, strict mode + extra strictness (`noImplicitOverride`, `noPropertyAccessFromIndexSignature`, `noImplicitReturns`), `moduleResolution: bundler`, `experimentalDecorators: true` |
| `tsconfig.app.json` | Extends base; entry point `src/main.ts` only |
| `angular.json` | Project name `fangri-la`; builder `application`; output `www/`; Ionic CSS included; component schematic defaults: `scss`, `standalone: true` |
| `nixpacks.toml` | Railway build: `npm ci && npm run build` → start: `node server.js` |
