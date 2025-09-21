import { Injectable, inject } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class RoleGuard implements CanActivate {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    const allowedRoles = next.data['roles'] as string[];
    
    if (!allowedRoles || allowedRoles.length === 0) {
      return true; // No role restriction
    }

    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return false;
    }

    if (this.authService.hasAnyRole(allowedRoles)) {
      return true;
    }

    // Redirect to dashboard if user doesn't have required role
    this.router.navigate(['/dashboard']);
    return false;
  }
}
