# Fangri-la — Frontend

Ionic/Angular mobile app for the Fangri-la headless Shopify storefront.
Built with standalone components, Angular Signals for state management, and Capacitor for native device access.

**Live URL:** `https://vibrant-miracle-marto.up.railway.app`

---

## Tech Stack

| | |
|---|---|
| Framework | Ionic 8 / Angular 20 |
| Components | Angular Standalone Components |
| State management | Angular Signals |
| HTTP | Angular HttpClient |
| Native runtime | Capacitor 6 |
| Language | TypeScript 5.8 |
| Deployment | Railway (Nixpacks) — served by a small Express static server |

---

## Project Structure

```
frontend/
├── angular.json
├── capacitor.config.ts         Capacitor app config (appId, webDir, plugins)
├── nixpacks.toml               Railway build config
├── package.json
├── server.js                   Express static file server used by Railway
├── tsconfig.json
├── tsconfig.app.json
├── public/
│   ├── manifest.webmanifest
│   └── assets/icon/            App icons
└── src/
    ├── index.html
    ├── main.ts                 bootstrapApplication entry point
    ├── styles.scss             Global Ionic theming + badge utility classes
    ├── environments/
    │   ├── environment.ts          apiUrl → http://localhost:3000  (dev)
    │   └── environment.prod.ts     apiUrl → Railway backend URL    (prod)
    └── app/
        ├── app.component.ts        Root component — IonApp + IonRouterOutlet
        ├── app.config.ts           App providers (router, HttpClient, Ionic, auth interceptor)
        ├── app.routes.ts           Lazy-loaded route definitions
        ├── core/
        │   ├── interceptors/
        │   │   └── auth.interceptor.ts     Attaches JWT Bearer token to every HTTP request
        │   └── services/
        │       ├── auth.service.ts         Customer auth state (Signals + localStorage)
        │       ├── cart.service.ts         Cart state (Signals + localStorage cart ID)
        │       └── shopify.service.ts      All backend API calls + product badge helpers
        └── pages/
            ├── home/               IonTabs shell with bottom tab bar
            ├── collections/        Product grid with infinite scroll pagination
            ├── product-detail/     Product images, variant selector, add-to-cart
            ├── cart/               Line items, quantity controls, subtotal, checkout CTA
            ├── checkout/           Shipping address form → Shopify hosted checkout (Capacitor Browser)
            ├── auth/               Login / register with segment toggle
            ├── profile/            Customer info, orders link, sign-out
            └── orders/             Order history list with fulfillment status badges
```

---

## Local Development

### 1. Install dependencies

```bash
npm install
```

### 2. Start the development server

```bash
npm start
```

The app runs at `http://localhost:4200` and calls the backend at `http://localhost:3000`
(configured in `src/environments/environment.ts`).

The backend must be running locally for API calls to work — see the
[backend README](../backend/README.md).

### 3. Build for production

```bash
npm run build
```

Output is written to `www/`. This is what `server.js` serves in production.

---

## Available Scripts

| Script | Description |
|---|---|
| `npm start` | Start Angular dev server on port 4200 |
| `npm run build` | Production build → `www/` |
| `npm run build:dev` | Development build → `www/` |
| `npm test` | Run unit tests with Karma |
| `npm run lint` | Lint TypeScript sources |

---

## Routing

All routes are lazy-loaded.

| Path | Page | Description |
|---|---|---|
| `/` | — | Redirects to `/tabs/collections` |
| `/tabs/collections` | CollectionsPage | Product grid |
| `/tabs/cart` | CartPage | Shopping cart |
| `/tabs/profile` | ProfilePage | Customer account |
| `/product/:handle` | ProductDetailPage | Product detail |
| `/checkout` | CheckoutPage | Shipping + payment redirect |
| `/auth` | AuthPage | Login / register |
| `/orders` | OrdersPage | Order history |
| `/orders/:id` | OrdersPage | Order detail |

---

## State Management

State is managed entirely with Angular Signals — no NgRx or BehaviorSubjects.

### AuthService (`core/services/auth.service.ts`)

| Signal | Type | Description |
|---|---|---|
| `token` | `string \| null` | JWT from localStorage (`fangrila_auth_token`) |
| `isLoggedIn` | `boolean` | Computed — true when token is set |
| `customer` | `Customer \| null` | Loaded profile from `/api/auth/me` |

### CartService (`core/services/cart.service.ts`)

| Signal | Type | Description |
|---|---|---|
| `cart` | `Cart \| null` | Current cart state |
| `itemCount` | `number` | Computed — total item quantity |
| `cartId` | `string \| null` | Computed — cart GID (also persisted in localStorage) |

---

## Auth Interceptor

`core/interceptors/auth.interceptor.ts` is a functional `HttpInterceptorFn` registered in
`app.config.ts` via `withInterceptors([authInterceptor])`.

It reads the JWT from `AuthService.token()` and attaches it to every outgoing HTTP request:

```
Authorization: Bearer <jwt>
```

---

## Product Badges

Badge logic lives in `ShopifyService.getBadges()` and is driven by Shopify product tags and metafields:

| Condition | Badge style | Label |
|---|---|---|
| tag `exclusive-early-access` | Yellow | EXCLUSIVE EARLY ACCESS |
| tag `pre-order` | Yellow | PRE-ORDER |
| tag `digital-collectible` | Dark | DIGITAL COLLECTIBLE |
| tag `virtual-vinyl` | Dark | VIRTUAL VINYL™ |
| tag `wearable` | Dark | WEARABLE |
| metafield `custom.availability_tier = "devotee"` | Pink | DEVOTEE |
| `totalInventory > 0` | Teal | X OF Y AVAILABLE |

Badge CSS utility classes are defined in `src/styles.scss`:
`.badge--yellow`, `.badge--dark`, `.badge--teal`, `.badge--pink`

---

## Checkout Flow

```
Cart page
  └─► PUT /api/cart/:cartId/buyer  (shipping address + optional customer token)
        └─► GET /api/cart/:cartId/checkout-url
              └─► Browser.open(checkoutUrl)   ← Capacitor in-app browser
                    └─► Shopify hosted checkout (payment)
                          └─► User taps "I've completed my order"
                                └─► Cart cleared from state + localStorage
```

---

## Environment Configuration

| File | `apiUrl` | Used when |
|---|---|---|
| `src/environments/environment.ts` | `http://localhost:3000` | `ng serve` / `npm start` |
| `src/environments/environment.prod.ts` | `https://fangri-la-marto.up.railway.app` | `ng build --configuration production` |

To point dev to a different backend, edit `environment.ts`.

---

## Deployment

The frontend is deployed as a Railway service (`vibrant-miracle`).
The build process compiles the Angular app then serves it with a minimal Express static server
(`server.js`) that handles SPA routing by returning `index.html` for all paths.

### Deploy

```bash
railway up --path-as-root frontend/ --service vibrant-miracle --detach
```

### View logs

```bash
railway logs --service vibrant-miracle
```

---

## Native App (Capacitor)

To run on a physical device or simulator:

```bash
# Build the web app first
npm run build

# Add a platform (first time only)
npx cap add ios
npx cap add android

# Sync web build to native projects
npx cap sync

# Open in Xcode / Android Studio
npx cap open ios
npx cap open android
```

Capacitor config is in `capacitor.config.ts`.
The `Browser` plugin is used to open the Shopify hosted checkout URL in an in-app browser.
