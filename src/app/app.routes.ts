import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'tabs/collections',
    pathMatch: 'full',
  },
  {
    path: 'tabs',
    loadComponent: () => import('./pages/home/home.page').then((m) => m.HomePage),
    children: [
      {
        path: 'collections',
        loadComponent: () =>
          import('./pages/collections/collections.page').then((m) => m.CollectionsPage),
      },
      {
        path: 'cart',
        loadComponent: () => import('./pages/cart/cart.page').then((m) => m.CartPage),
      },
      {
        path: 'profile',
        loadComponent: () => import('./pages/profile/profile.page').then((m) => m.ProfilePage),
      },
      {
        path: '',
        redirectTo: 'collections',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: 'product/:handle',
    loadComponent: () =>
      import('./pages/product-detail/product-detail.page').then((m) => m.ProductDetailPage),
  },
  {
    path: 'checkout',
    loadComponent: () => import('./pages/checkout/checkout.page').then((m) => m.CheckoutPage),
  },
  {
    path: 'auth',
    loadComponent: () => import('./pages/auth/auth.page').then((m) => m.AuthPage),
  },
  {
    path: 'orders',
    loadComponent: () => import('./pages/orders/orders.page').then((m) => m.OrdersPage),
  },
  {
    path: 'orders/:id',
    loadComponent: () => import('./pages/orders/orders.page').then((m) => m.OrdersPage),
  },
  {
    path: '**',
    redirectTo: 'tabs/collections',
  },
];
