import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, BehaviorSubject, tap, catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { RBACService, DEFAULT_RBAC_CONFIG } from '../config/rbac.config';

export interface User {
  id: string;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  role: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
  first_name: string;
  last_name: string;
  role?: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  request_id: string;
}

export interface BackendApiResponse<T> {
  requestId: string;
  timestamp: string;
  data: T;
  status: string;
  error?: {
    code: string;
    message: string;
    details?: string;
  };
}

export interface ApiError {
  success: false;
  message: string;
  errors?: { [key: string]: string[] };
  request_id: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly API_URL = environment.apiUrl;
  private readonly rbacService = new RBACService(DEFAULT_RBAC_CONFIG);
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private isInitializedSubject = new BehaviorSubject<boolean>(false);
  public currentUser$ = this.currentUserSubject.asObservable();
  public isInitialized$ = this.isInitializedSubject.asObservable();

  constructor() {
    this.loadUserFromStorage();
  }

  login(credentials: LoginRequest): Observable<BackendApiResponse<LoginResponse>> {
    return this.http
      .post<BackendApiResponse<LoginResponse>>(`${this.API_URL}/auth/login`, credentials)
      .pipe(
        tap(response => {
          if (response.status === 'success' && response.data) {
            localStorage.setItem('token', response.data.token);
            this.currentUserSubject.next(response.data.user);
          }
        }),
        catchError(this.handleError)
      );
  }

  register(userData: RegisterRequest): Observable<BackendApiResponse<User>> {
    return this.http
      .post<BackendApiResponse<User>>(`${this.API_URL}/auth/register`, userData)
      .pipe(catchError(this.handleError));
  }

  logout(): void {
    localStorage.removeItem('token');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  getProfile(): Observable<BackendApiResponse<User>> {
    return this.http
      .get<BackendApiResponse<User>>(`${this.API_URL}/auth/profile`)
      .pipe(catchError(this.handleError));
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    return !!token;
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user ? user.role === role : false;
  }

  isAdmin(): boolean {
    return this.hasRole('admin');
  }

  isUser(): boolean {
    return this.hasRole('user');
  }

  hasAnyRole(roles: string[]): boolean {
    const user = this.getCurrentUser();
    return user ? this.rbacService.hasAnyRole(user.role, roles) : false;
  }

  hasPermission(permission: string): boolean {
    const user = this.getCurrentUser();
    return user ? this.rbacService.hasPermission(user.role, permission) : false;
  }

  hasAnyPermission(permissions: string[]): boolean {
    const user = this.getCurrentUser();
    return user ? this.rbacService.hasAnyPermission(user.role, permissions) : false;
  }

  hasAllPermissions(permissions: string[]): boolean {
    const user = this.getCurrentUser();
    return user ? this.rbacService.hasAllPermissions(user.role, permissions) : false;
  }

  canAccessRoute(routePath: string): boolean {
    const user = this.getCurrentUser();
    return user ? this.rbacService.canAccessRoute(user.role, routePath) : false;
  }

  getRBACService(): RBACService {
    return this.rbacService;
  }

  private loadUserFromStorage(): void {
    const token = this.getToken();
    if (token) {
      this.getProfile().subscribe({
        next: response => {
          if (response.status === 'success' && response.data) {
            this.currentUserSubject.next(response.data);
          }
          this.isInitializedSubject.next(true);
        },
        error: error => {
          console.error('Failed to load user profile:', error);
          this.logout();
          this.isInitializedSubject.next(true);
        },
      });
    } else {
      this.isInitializedSubject.next(true);
    }
  }

  private handleError = (error: HttpErrorResponse): Observable<never> => {
    let errorMessage = 'An unexpected error occurred';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Client Error: ${error.error.message}`;
    } else {
      // Server-side error
      if (error.error && error.error.message) {
        errorMessage = error.error.message;
      } else if (error.status === 0) {
        errorMessage = 'Unable to connect to server. Please check your internet connection.';
      } else if (error.status === 401) {
        errorMessage = 'Authentication failed. Please login again.';
        this.logout();
      } else if (error.status === 403) {
        errorMessage = 'Access denied. You do not have permission to perform this action.';
      } else if (error.status === 404) {
        errorMessage = 'The requested resource was not found.';
      } else if (error.status === 500) {
        errorMessage = 'Internal server error. Please try again later.';
      } else {
        errorMessage = `Server Error: ${error.status} - ${error.statusText}`;
      }
    }

    console.error('Auth Service Error:', error);
    return throwError(() => new Error(errorMessage));
  };
}
