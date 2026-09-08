import { Routes } from '@angular/router';
import { authGuard, adminGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent) },
  {
    path: '',
    loadComponent: () => import('./components/layout/layout.component').then(m => m.LayoutComponent),
    canActivate: [authGuard],
    children: [
      { path: 'products', loadComponent: () => import('./components/products/product-list.component').then(m => m.ProductListComponent) },
      { path: 'products/new', loadComponent: () => import('./components/products/product-form.component').then(m => m.ProductFormComponent), canActivate: [adminGuard] },
      { path: 'products/:id/edit', loadComponent: () => import('./components/products/product-form.component').then(m => m.ProductFormComponent), canActivate: [adminGuard] },
      { path: 'orders', loadComponent: () => import('./components/orders/order-list.component').then(m => m.OrderListComponent) },
      { path: 'orders/new', loadComponent: () => import('./components/orders/order-create.component').then(m => m.OrderCreateComponent) },
      { path: 'orders/:id', loadComponent: () => import('./components/orders/order-detail.component').then(m => m.OrderDetailComponent) },
      { path: 'inventory/:productId', loadComponent: () => import('./components/inventory/inventory-history.component').then(m => m.InventoryHistoryComponent) },
      { path: '', redirectTo: 'products', pathMatch: 'full' }
    ]
  },
  { path: '**', redirectTo: 'login' }
];
