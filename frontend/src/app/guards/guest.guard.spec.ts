import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { GuestGuard } from './guest.guard';
import { AuthService } from '../services/auth.service';

describe('GuestGuard', () => {
  let guard: GuestGuard;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    const authSpy = jasmine.createSpyObj('AuthService', ['isAuthenticated']);
    const routerSpyObj = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        GuestGuard,
        { provide: AuthService, useValue: authSpy },
        { provide: Router, useValue: routerSpyObj },
      ],
    });

    guard = TestBed.inject(GuestGuard);
    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  it('should allow access when user is not authenticated', () => {
    authServiceSpy.isAuthenticated.and.returnValue(false);

    const result = guard.canActivate();

    expect(result).toBe(true);
    expect(authServiceSpy.isAuthenticated).toHaveBeenCalled();
    expect(routerSpy.navigate).not.toHaveBeenCalled();
  });

  it('should deny access and redirect to dashboard when user is authenticated', () => {
    authServiceSpy.isAuthenticated.and.returnValue(true);

    const result = guard.canActivate();

    expect(result).toBe(false);
    expect(authServiceSpy.isAuthenticated).toHaveBeenCalled();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  it('should call isAuthenticated method', () => {
    authServiceSpy.isAuthenticated.and.returnValue(false);

    guard.canActivate();

    expect(authServiceSpy.isAuthenticated).toHaveBeenCalledTimes(1);
  });

  it('should handle multiple calls correctly', () => {
    authServiceSpy.isAuthenticated.and.returnValue(false);

    const result1 = guard.canActivate();
    const result2 = guard.canActivate();

    expect(result1).toBe(true);
    expect(result2).toBe(true);
    expect(authServiceSpy.isAuthenticated).toHaveBeenCalledTimes(2);
    expect(routerSpy.navigate).not.toHaveBeenCalled();
  });

  it('should redirect to dashboard on each authentication attempt', () => {
    authServiceSpy.isAuthenticated.and.returnValue(true);

    guard.canActivate();
    guard.canActivate();

    expect(routerSpy.navigate).toHaveBeenCalledTimes(2);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  it('should work correctly with different authentication states', () => {
    // First call - not authenticated
    authServiceSpy.isAuthenticated.and.returnValue(false);
    let result = guard.canActivate();
    expect(result).toBe(true);
    expect(routerSpy.navigate).not.toHaveBeenCalled();

    // Second call - authenticated
    authServiceSpy.isAuthenticated.and.returnValue(true);
    result = guard.canActivate();
    expect(result).toBe(false);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/dashboard']);
  });
});
