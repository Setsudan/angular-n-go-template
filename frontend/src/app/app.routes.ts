import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { GuestGuard } from './guards/guest.guard';
import { PermissionGuard } from './guards/permission.guard';
import { createRoutes } from './config/routes.config';

// Create routes using configuration
export const routes: Routes = createRoutes();
