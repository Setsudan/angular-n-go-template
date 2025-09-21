import { Routes } from '@angular/router';
import { AuthGuard } from '../guards/auth.guard';
import { GuestGuard } from '../guards/guest.guard';
import { PermissionGuard } from '../guards/permission.guard';

export interface RouteConfig {
  path: string;
  loadComponent: () => Promise<any>;
  canActivate?: any[];
  data?: {
    permissions?: string[];
    roles?: string[];
    public?: boolean;
    description?: string;
  };
}

export const ROUTE_CONFIGS: RouteConfig[] = [
  {
    path: '',
    loadComponent: () => import('../pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [AuthGuard, PermissionGuard],
    data: {
      permissions: ['profile.read'],
      description: 'User dashboard',
    },
  },
  {
    path: 'login',
    loadComponent: () => import('../pages/login/login.component').then(m => m.LoginComponent),
    canActivate: [GuestGuard],
    data: {
      public: true,
      description: 'User login',
    },
  },
  {
    path: 'register',
    loadComponent: () => import('../pages/register/register.component').then(m => m.RegisterComponent),
    canActivate: [GuestGuard],
    data: {
      public: true,
      description: 'User registration',
    },
  },
  {
    path: 'dashboard',
    loadComponent: () => import('../pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [AuthGuard, PermissionGuard],
    data: {
      permissions: ['profile.read'],
      description: 'User dashboard',
    },
  },
  {
    path: 'admin',
    loadComponent: () => import('../pages/admin-dashboard/admin-dashboard').then(m => m.AdminDashboard),
    canActivate: [AuthGuard, PermissionGuard],
    data: {
      permissions: ['admin.logs.read', 'admin.stats.read'],
      description: 'Admin dashboard',
    },
  },
  {
    path: 'users',
    loadComponent: () => import('../pages/user-management/user-management').then(m => m.UserManagementComponent),
    canActivate: [AuthGuard, PermissionGuard],
    data: {
      permissions: ['users.read'],
      description: 'User management',
    },
  },
  {
    path: 'profile',
    loadComponent: () => import('../pages/profile/profile').then(m => m.ProfileComponent),
    canActivate: [AuthGuard, PermissionGuard],
    data: {
      permissions: ['profile.read'],
      description: 'User profile',
    },
  },
  {
    path: '**',
    loadComponent: () => import('../pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [AuthGuard, PermissionGuard],
    data: {
      permissions: ['profile.read'],
      description: 'Default redirect to dashboard',
    },
  },
];

export function createRoutes(): Routes {
  return ROUTE_CONFIGS.map(config => ({
    path: config.path,
    loadComponent: config.loadComponent,
    canActivate: config.canActivate,
    data: config.data,
  }));
}
