import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { RegisterComponent } from './register.component';
import { AuthService, ApiResponse, User } from '../../services/auth.service';
import { LoadingSpinnerComponent } from '../../components/shared/loading-spinner.component';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  const mockUser: User = {
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

  beforeEach(async () => {
    const authSpy = jasmine.createSpyObj('AuthService', ['register']);
    const routerSpyObj = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [RegisterComponent, ReactiveFormsModule, LoadingSpinnerComponent],
      providers: [
        { provide: AuthService, useValue: authSpy },
        { provide: Router, useValue: routerSpyObj },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty form', () => {
    expect(component.registerForm.get('email')?.value).toBe('');
    expect(component.registerForm.get('username')?.value).toBe('');
    expect(component.registerForm.get('firstName')?.value).toBe('');
    expect(component.registerForm.get('lastName')?.value).toBe('');
    expect(component.registerForm.get('password')?.value).toBe('');
    expect(component.registerForm.get('confirmPassword')?.value).toBe('');
  });

  it('should initialize with loading false and empty messages', () => {
    expect(component.isLoading).toBe(false);
    expect(component.errorMessage).toBe('');
    expect(component.successMessage).toBe('');
  });

  it('should have required validators on all fields', () => {
    const emailControl = component.registerForm.get('email');
    const usernameControl = component.registerForm.get('username');
    const firstNameControl = component.registerForm.get('firstName');
    const lastNameControl = component.registerForm.get('lastName');
    const passwordControl = component.registerForm.get('password');
    const confirmPasswordControl = component.registerForm.get('confirmPassword');

    expect(emailControl?.hasError('required')).toBe(true);
    expect(usernameControl?.hasError('required')).toBe(true);
    expect(firstNameControl?.hasError('required')).toBe(true);
    expect(lastNameControl?.hasError('required')).toBe(true);
    expect(passwordControl?.hasError('required')).toBe(true);
    expect(confirmPasswordControl?.hasError('required')).toBe(true);
  });

  it('should validate email format', () => {
    const emailControl = component.registerForm.get('email');
    
    emailControl?.setValue('invalid-email');
    expect(emailControl?.hasError('email')).toBe(true);

    emailControl?.setValue('valid@example.com');
    expect(emailControl?.hasError('email')).toBe(false);
  });

  it('should validate username minimum length', () => {
    const usernameControl = component.registerForm.get('username');
    
    usernameControl?.setValue('ab');
    expect(usernameControl?.hasError('minlength')).toBe(true);

    usernameControl?.setValue('abc');
    expect(usernameControl?.hasError('minlength')).toBe(false);
  });

  it('should validate password minimum length', () => {
    const passwordControl = component.registerForm.get('password');
    
    passwordControl?.setValue('1234567');
    expect(passwordControl?.hasError('minlength')).toBe(true);

    passwordControl?.setValue('12345678');
    expect(passwordControl?.hasError('minlength')).toBe(false);
  });

  it('should validate password match', () => {
    component.registerForm.patchValue({
      password: 'password123',
      confirmPassword: 'different123',
    });

    expect(component.registerForm.hasError('passwordMismatch')).toBe(true);
    expect(component.registerForm.get('confirmPassword')?.hasError('passwordMismatch')).toBe(true);
  });

  it('should not have password mismatch error when passwords match', () => {
    component.registerForm.patchValue({
      password: 'password123',
      confirmPassword: 'password123',
    });

    expect(component.registerForm.hasError('passwordMismatch')).toBe(false);
    expect(component.registerForm.get('confirmPassword')?.hasError('passwordMismatch')).toBe(false);
  });

  it('should not submit when form is invalid', () => {
    component.registerForm.patchValue({
      email: 'invalid-email',
      username: 'ab',
      firstName: '',
      lastName: '',
      password: '123',
      confirmPassword: 'different',
    });

    component.onSubmit();

    expect(authServiceSpy.register).not.toHaveBeenCalled();
  });

  it('should submit when form is valid', () => {
    const mockApiResponse: ApiResponse<User> = {
      success: true,
      data: mockUser,
      message: 'Registration successful',
      request_id: 'test-request-id',
    };

    authServiceSpy.register.and.returnValue(of(mockApiResponse));

    component.registerForm.patchValue({
      email: 'test@example.com',
      username: 'testuser',
      firstName: 'Test',
      lastName: 'User',
      password: 'password123',
      confirmPassword: 'password123',
    });

    component.onSubmit();

    expect(authServiceSpy.register).toHaveBeenCalledWith({
      email: 'test@example.com',
      username: 'testuser',
      first_name: 'Test',
      last_name: 'User',
      password: 'password123',
    });
  });

  it('should handle successful registration', () => {
    const mockApiResponse: ApiResponse<User> = {
      success: true,
      data: mockUser,
      message: 'Registration successful',
      request_id: 'test-request-id',
    };

    authServiceSpy.register.and.returnValue(of(mockApiResponse));

    component.registerForm.patchValue({
      email: 'test@example.com',
      username: 'testuser',
      firstName: 'Test',
      lastName: 'User',
      password: 'password123',
      confirmPassword: 'password123',
    });

    component.onSubmit();

    expect(component.isLoading).toBe(false);
    expect(component.successMessage).toBe('Account created successfully! Please login.');
  });

  it('should handle registration error', () => {
    const error = new Error('Registration failed');
    authServiceSpy.register.and.returnValue(throwError(() => error));
    spyOn(console, 'error');

    component.registerForm.patchValue({
      email: 'test@example.com',
      username: 'testuser',
      firstName: 'Test',
      lastName: 'User',
      password: 'password123',
      confirmPassword: 'password123',
    });

    component.onSubmit();

    expect(component.isLoading).toBe(false);
    expect(component.errorMessage).toBe('Registration failed');
    expect(console.error).toHaveBeenCalledWith('Registration error:', error);
  });

  it('should set loading state during registration', () => {
    const mockApiResponse: ApiResponse<User> = {
      success: true,
      data: mockUser,
      message: 'Registration successful',
      request_id: 'test-request-id',
    };

    authServiceSpy.register.and.returnValue(of(mockApiResponse));

    component.registerForm.patchValue({
      email: 'test@example.com',
      username: 'testuser',
      firstName: 'Test',
      lastName: 'User',
      password: 'password123',
      confirmPassword: 'password123',
    });

    component.onSubmit();

    expect(component.isLoading).toBe(true);
    expect(component.errorMessage).toBe('');
    expect(component.successMessage).toBe('');
  });

  it('should clear messages on new registration attempt', () => {
    component.errorMessage = 'Previous error';
    component.successMessage = 'Previous success';
    const mockApiResponse: ApiResponse<User> = {
      success: true,
      data: mockUser,
      message: 'Registration successful',
      request_id: 'test-request-id',
    };

    authServiceSpy.register.and.returnValue(of(mockApiResponse));

    component.registerForm.patchValue({
      email: 'test@example.com',
      username: 'testuser',
      firstName: 'Test',
      lastName: 'User',
      password: 'password123',
      confirmPassword: 'password123',
    });

    component.onSubmit();

    expect(component.errorMessage).toBe('');
    expect(component.successMessage).toBe('');
  });
});