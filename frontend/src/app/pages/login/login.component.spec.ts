import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { LoginComponent } from './login.component';
import { AuthService, ApiResponse, LoginResponse } from '../../services/auth.service';
import { LoadingSpinnerComponent } from '../../components/shared/loading-spinner.component';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  const mockUser = {
    id: '1',
    email: 'test@example.com',
    username: 'testuser',
    first_name: 'Test',
    last_name: 'User',
    role: 'user',
    is_active: true,
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
  };

  const mockLoginResponse: LoginResponse = {
    token: 'mock-jwt-token',
    user: mockUser,
  };

  beforeEach(async () => {
    const authSpy = jasmine.createSpyObj('AuthService', ['login']);
    const routerSpyObj = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [LoginComponent, ReactiveFormsModule, LoadingSpinnerComponent],
      providers: [
        { provide: AuthService, useValue: authSpy },
        { provide: Router, useValue: routerSpyObj },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty form', () => {
    expect(component.loginForm.get('email')?.value).toBe('');
    expect(component.loginForm.get('password')?.value).toBe('');
  });

  it('should initialize with loading false and empty error message', () => {
    expect(component.isLoading).toBe(false);
    expect(component.errorMessage).toBe('');
  });

  it('should have required validators on email and password', () => {
    const emailControl = component.loginForm.get('email');
    const passwordControl = component.loginForm.get('password');

    expect(emailControl?.hasError('required')).toBe(true);
    expect(passwordControl?.hasError('required')).toBe(true);
  });

  it('should validate email format', () => {
    const emailControl = component.loginForm.get('email');
    
    emailControl?.setValue('invalid-email');
    expect(emailControl?.hasError('email')).toBe(true);

    emailControl?.setValue('valid@example.com');
    expect(emailControl?.hasError('email')).toBe(false);
  });

  it('should not submit when form is invalid', () => {
    component.loginForm.patchValue({
      email: 'invalid-email',
      password: '',
    });

    component.onSubmit();

    expect(authServiceSpy.login).not.toHaveBeenCalled();
  });

  it('should submit when form is valid', () => {
    const mockApiResponse: ApiResponse<LoginResponse> = {
      success: true,
      data: mockLoginResponse,
      message: 'Login successful',
      request_id: 'test-request-id',
    };

    authServiceSpy.login.and.returnValue(of(mockApiResponse));

    component.loginForm.patchValue({
      email: 'test@example.com',
      password: 'password123',
    });

    component.onSubmit();

    expect(authServiceSpy.login).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    });
  });

  it('should handle successful login and navigate to dashboard', () => {
    const mockApiResponse: ApiResponse<LoginResponse> = {
      success: true,
      data: mockLoginResponse,
      message: 'Login successful',
      request_id: 'test-request-id',
    };

    authServiceSpy.login.and.returnValue(of(mockApiResponse));

    component.loginForm.patchValue({
      email: 'test@example.com',
      password: 'password123',
    });

    component.onSubmit();

    expect(routerSpy.navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  it('should handle login error', () => {
    const error = new Error('Login failed');
    authServiceSpy.login.and.returnValue(throwError(() => error));
    spyOn(console, 'error');

    component.loginForm.patchValue({
      email: 'test@example.com',
      password: 'wrongpassword',
    });

    component.onSubmit();

    expect(component.isLoading).toBe(false);
    expect(component.errorMessage).toBe('Login failed');
    expect(console.error).toHaveBeenCalledWith('Login error:', error);
  });

  it('should set loading state during login', () => {
    const mockApiResponse: ApiResponse<LoginResponse> = {
      success: true,
      data: mockLoginResponse,
      message: 'Login successful',
      request_id: 'test-request-id',
    };

    authServiceSpy.login.and.returnValue(of(mockApiResponse));

    component.loginForm.patchValue({
      email: 'test@example.com',
      password: 'password123',
    });

    component.onSubmit();

    expect(component.isLoading).toBe(true);
    expect(component.errorMessage).toBe('');
  });

  it('should clear error message on new login attempt', () => {
    component.errorMessage = 'Previous error';
    const mockApiResponse: ApiResponse<LoginResponse> = {
      success: true,
      data: mockLoginResponse,
      message: 'Login successful',
      request_id: 'test-request-id',
    };

    authServiceSpy.login.and.returnValue(of(mockApiResponse));

    component.loginForm.patchValue({
      email: 'test@example.com',
      password: 'password123',
    });

    component.onSubmit();

    expect(component.errorMessage).toBe('');
  });
});