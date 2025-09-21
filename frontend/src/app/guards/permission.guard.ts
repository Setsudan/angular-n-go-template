import { Injectable, inject } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { RBACService, DEFAULT_RBAC_CONFIG } from '../config/rbac.config';

@Injectable({
  providedIn: 'root',
})
export class PermissionGuard implements CanActivate {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly rbacService = new RBACService(DEFAULT_RBAC_CONFIG);

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    const user = this.authService.getCurrentUser();
    
    if (!user) {
      this.router.navigate(['/login']);
      return false;
    }

    // Check if route has permission requirements
    const requiredPermissions = next.data['permissions'] as string[];
    const requiredRoles = next.data['roles'] as string[];
    const isPublic = next.data['public'] as boolean;

    // Allow public routes
    if (isPublic) {
      return true;
    }

    // Check role-based access
    if (requiredRoles && requiredRoles.length > 0) {
      if (this.rbacService.hasAnyRole(user.role, requiredRoles)) {
        return true;
      }
    }

    // Check permission-based access
    if (requiredPermissions && requiredPermissions.length > 0) {
      if (this.rbacService.hasAnyPermission(user.role, requiredPermissions)) {
        return true;
      }
    }

    // If no specific requirements, check route-based access
    if (!requiredPermissions && !requiredRoles) {
      if (this.rbacService.canAccessRoute(user.role, state.url)) {
        return true;
      }
    }

    // Redirect based on user role
    this.redirectBasedOnRole(user.role);
    return false;
  }

  private redirectBasedOnRole(role: string): void {
    switch (role) {
      case 'admin':
        this.router.navigate(['/admin']);
        break;
      case 'moderator':
        this.router.navigate(['/dashboard']);
        break;
      case 'user':
      default:
        this.router.navigate(['/dashboard']);
        break;
    }
  }
}
