import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import {
  AuthService,
  User,
  LoginRequest,
  RegisterRequest,
  LoginResponse,
  ApiResponse,
} from './auth.service';
import { environment } from '../../environments/environment';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
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

  const mockLoginResponse: LoginResponse = {
    token: 'mock-jwt-token',
    user: mockUser,
  };

  beforeEach(() => {
    const routerSpyObj = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService, { provide: Router, useValue: routerSpyObj }],
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('login', () => {
    it('should login successfully and store token', () => {
      const credentials: LoginRequest = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockApiResponse: ApiResponse<LoginResponse> = {
        success: true,
        data: mockLoginResponse,
        message: 'Login successful',
        request_id: 'test-request-id',
      };

      service.login(credentials).subscribe(response => {
        expect(response).toEqual(mockApiResponse);
        expect(localStorage.getItem('token')).toBe('mock-jwt-token');
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(credentials);
      req.flush(mockApiResponse);
    });

    it('should handle login failure', () => {
      const credentials: LoginRequest = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      service.login(credentials).subscribe({
        next: () => fail('should have failed'),
        error: error => {
          expect(error.message).toContain('Login failed');
        },
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
      req.flush(
        {
          success: false,
          message: 'Invalid credentials',
          request_id: 'test-request-id',
        },
        { status: 401, statusText: 'Unauthorized' }
      );
    });
  });

  describe('register', () => {
    it('should register successfully', () => {
      const userData: RegisterRequest = {
        email: 'newuser@example.com',
        username: 'newuser',
        password: 'password123',
        first_name: 'New',
        last_name: 'User',
      };

      const mockApiResponse: ApiResponse<User> = {
        success: true,
        data: mockUser,
        message: 'Registration successful',
        request_id: 'test-request-id',
      };

      service.register(userData).subscribe(response => {
        expect(response).toEqual(mockApiResponse);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/register`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(userData);
      req.flush(mockApiResponse);
    });

    it('should handle registration failure', () => {
      const userData: RegisterRequest = {
        email: 'existing@example.com',
        username: 'existinguser',
        password: 'password123',
        first_name: 'Existing',
        last_name: 'User',
      };

      service.register(userData).subscribe({
        next: () => fail('should have failed'),
        error: error => {
          expect(error.message).toContain('Registration failed');
        },
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/register`);
      req.flush(
        {
          success: false,
          message: 'Email already exists',
          request_id: 'test-request-id',
        },
        { status: 400, statusText: 'Bad Request' }
      );
    });
  });

  describe('logout', () => {
    it('should clear token and navigate to login', () => {
      localStorage.setItem('token', 'mock-token');
      service.currentUser$.subscribe(user => {
        expect(user).toBeNull();
      });

      service.logout();

      expect(localStorage.getItem('token')).toBeNull();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
    });
  });

  describe('getProfile', () => {
    it('should get user profile successfully', () => {
      const mockApiResponse: ApiResponse<User> = {
        success: true,
        data: mockUser,
        message: 'Profile retrieved successfully',
        request_id: 'test-request-id',
      };

      service.getProfile().subscribe(response => {
        expect(response).toEqual(mockApiResponse);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/profile`);
      expect(req.request.method).toBe('GET');
      req.flush(mockApiResponse);
    });
  });

  describe('getToken', () => {
    it('should return token from localStorage', () => {
      localStorage.setItem('token', 'mock-token');
      expect(service.getToken()).toBe('mock-token');
    });

    it('should return null when no token exists', () => {
      expect(service.getToken()).toBeNull();
    });
  });

  describe('isAuthenticated', () => {
    it('should return true when token exists', () => {
      localStorage.setItem('token', 'mock-token');
      expect(service.isAuthenticated()).toBe(true);
    });

    it('should return false when no token exists', () => {
      expect(service.isAuthenticated()).toBe(false);
    });
  });

  describe('getCurrentUser', () => {
    it('should return current user', () => {
      service['currentUserSubject'].next(mockUser);
      expect(service.getCurrentUser()).toEqual(mockUser);
    });

    it('should return null when no user is set', () => {
      expect(service.getCurrentUser()).toBeNull();
    });
  });

  describe('loadUserFromStorage', () => {
    it('should load user from storage when token exists', () => {
      localStorage.setItem('token', 'mock-token');
      const mockApiResponse: ApiResponse<User> = {
        success: true,
        data: mockUser,
        message: 'Profile retrieved successfully',
        request_id: 'test-request-id',
      };

      // Create a new service instance to trigger loadUserFromStorage
      const newService = new AuthService();

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/profile`);
      req.flush(mockApiResponse);

      newService.currentUser$.subscribe((user: User | null) => {
        expect(user).toEqual(mockUser);
      });
    });

    it('should logout when profile loading fails', () => {
      localStorage.setItem('token', 'invalid-token');
      spyOn(console, 'error');

      // Create a new service instance to trigger loadUserFromStorage
      new AuthService();

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/profile`);
      req.flush({ message: 'Invalid token' }, { status: 401, statusText: 'Unauthorized' });

      expect(console.error).toHaveBeenCalled();
      expect(localStorage.getItem('token')).toBeNull();
    });
  });

  describe('handleError', () => {
    it('should handle client-side errors', () => {
      const clientError = new ErrorEvent('Client Error', {
        message: 'Network error',
      });

      const httpError = new HttpErrorResponse({
        error: clientError,
        status: 0,
        statusText: 'Unknown Error',
      });

      service.login({ email: 'test@example.com', password: 'password' }).subscribe({
        next: () => fail('should have failed'),
        error: error => {
          expect(error.message).toContain('Client Error: Network error');
        },
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
      req.error(clientError);
    });

    it('should handle 401 errors and logout', () => {
      service.login({ email: 'test@example.com', password: 'password' }).subscribe({
        next: () => fail('should have failed'),
        error: error => {
          expect(error.message).toContain('Authentication failed');
        },
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
      req.flush({ message: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });

      expect(localStorage.getItem('token')).toBeNull();
    });

    it('should handle 403 errors', () => {
      service.login({ email: 'test@example.com', password: 'password' }).subscribe({
        next: () => fail('should have failed'),
        error: error => {
          expect(error.message).toContain('Access denied');
        },
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
      req.flush({ message: 'Forbidden' }, { status: 403, statusText: 'Forbidden' });
    });

    it('should handle 404 errors', () => {
      service.login({ email: 'test@example.com', password: 'password' }).subscribe({
        next: () => fail('should have failed'),
        error: error => {
          expect(error.message).toContain('The requested resource was not found');
        },
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
      req.flush({ message: 'Not Found' }, { status: 404, statusText: 'Not Found' });
    });

    it('should handle 500 errors', () => {
      service.login({ email: 'test@example.com', password: 'password' }).subscribe({
        next: () => fail('should have failed'),
        error: error => {
          expect(error.message).toContain('Internal server error');
        },
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
      req.flush(
        { message: 'Internal Server Error' },
        { status: 500, statusText: 'Internal Server Error' }
      );
    });

    it('should handle connection errors', () => {
      service.login({ email: 'test@example.com', password: 'password' }).subscribe({
        next: () => fail('should have failed'),
        error: error => {
          expect(error.message).toContain('Unable to connect to server');
        },
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
      req.error(new ErrorEvent('Network error'));
    });
  });
});
