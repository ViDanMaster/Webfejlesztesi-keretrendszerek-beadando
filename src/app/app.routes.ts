import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: 'home',
        loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent)
    },
    {
        path: 'products/add',
        loadComponent: () => import('./pages/product-form/product-form.component').then(m => m.ProductFormComponent)
    },
    {
        path: 'products/edit/:id',
        loadComponent: () => import('./pages/product-form/product-form.component').then(m => m.ProductFormComponent)
    },
    {
        path: 'products/:id',
        loadComponent: () => import('./pages/product-details/product-details.component').then(m => m.ProductDetailsComponent)
    },
    {
        path: 'categories',
        loadComponent: () => import('./pages/category-list/category-list.component').then(m => m.CategoryListComponent)
    },
    {
        path: 'categories/add',
        loadComponent: () => import('./pages/category-form/category-form.component').then(m => m.CategoryFormComponent)
    },
    {
        path: 'categories/edit/:id',
        loadComponent: () => import('./pages/category-form/category-form.component').then(m => m.CategoryFormComponent)
    },
    {
        path: 'profile',
        loadComponent: () => import('./pages/user-profile/user-profile.component').then(m => m.UserProfileComponent)
    },
    {
        path: 'login',
        loadComponent: () => import('./pages/auth/login/login.component').then(m => m.LoginComponent)
    },
    {
        path: 'register',
        loadComponent: () => import('./pages/auth/register/register.component').then(m => m.RegisterComponent)
    },
    {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
    },
    {
        path: '**',
        redirectTo: 'home'
    }
];