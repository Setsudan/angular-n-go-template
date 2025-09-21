import { TestBed } from '@angular/core/testing';
import { HttpRequest, HttpErrorResponse, HttpEvent } from '@angular/common/http';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { errorInterceptor } from './error.interceptor';
import { AuthService } from '../services/auth.service';

describe('errorInterceptor', () => {
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let mockHandler: jasmine.Spy;

  beforeEach(() => {
    const authSpy = jasmine.createSpyObj('AuthService', ['logout']);
    const routerSpyObj = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authSpy },
        { provide: Router, useValue: routerSpyObj },
      ],
    });

    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    mockHandler = jasmine.createSpy('HttpHandlerFn').and.returnValue(of({} as HttpEvent<unknown>));
  });

  it('should pass through successful requests', () => {
    const request = new HttpRequest('GET', '/api/test');
    const mockEvent: HttpEvent<unknown> = {} as HttpEvent<unknown>;
    mockHandler.and.returnValue(of(mockEvent));

    errorInterceptor(request, mockHandler).subscribe(result => {
      expect(result).toBe(mockEvent);
    });

    expect(mockHandler).toHaveBeenCalledWith(request);
  });

  it('should handle client-side errors', () => {
    const request = new HttpRequest('GET', '/api/test');
    const clientError = new ErrorEvent('Client Error', {
      message: 'Network error',
    });
    const httpError = new HttpErrorResponse({
      error: clientError,
      status: 0,
      statusText: 'Unknown Error',
    });

    mockHandler.and.returnValue(throwError(() => httpError));

    errorInterceptor(request, mockHandler).subscribe({
      next: () => fail('should have failed'),
      error: error => {
        expect(error.message).toContain('Client Error: Network error');
      },
    });
  });

  it('should handle 401 errors and logout', () => {
    const request = new HttpRequest('GET', '/api/test');
    const httpError = new HttpErrorResponse({
      error: { message: 'Unauthorized' },
      status: 401,
      statusText: 'Unauthorized',
    });

    mockHandler.and.returnValue(throwError(() => httpError));

    errorInterceptor(request, mockHandler).subscribe({
      next: () => fail('should have failed'),
      error: error => {
        expect(error.message).toContain('Authentication failed');
        expect(authServiceSpy.logout).toHaveBeenCalled();
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
      },
    });
  });

  it('should handle 403 errors', () => {
    const request = new HttpRequest('GET', '/api/test');
    const httpError = new HttpErrorResponse({
      error: { message: 'Forbidden' },
      status: 403,
      statusText: 'Forbidden',
    });

    mockHandler.and.returnValue(throwError(() => httpError));

    errorInterceptor(request, mockHandler).subscribe({
      next: () => fail('should have failed'),
      error: error => {
        expect(error.message).toContain('Access denied');
        expect(authServiceSpy.logout).not.toHaveBeenCalled();
        expect(routerSpy.navigate).not.toHaveBeenCalled();
      },
    });
  });

  it('should handle 404 errors', () => {
    const request = new HttpRequest('GET', '/api/test');
    const httpError = new HttpErrorResponse({
      error: { message: 'Not Found' },
      status: 404,
      statusText: 'Not Found',
    });

    mockHandler.and.returnValue(throwError(() => httpError));

    errorInterceptor(request, mockHandler).subscribe({
      next: () => fail('should have failed'),
      error: error => {
        expect(error.message).toContain('The requested resource was not found');
      },
    });
  });

  it('should handle 500 errors', () => {
    const request = new HttpRequest('GET', '/api/test');
    const httpError = new HttpErrorResponse({
      error: { message: 'Internal Server Error' },
      status: 500,
      statusText: 'Internal Server Error',
    });

    mockHandler.and.returnValue(throwError(() => httpError));

    errorInterceptor(request, mockHandler).subscribe({
      next: () => fail('should have failed'),
      error: error => {
        expect(error.message).toContain('Internal server error');
      },
    });
  });

  it('should handle connection errors', () => {
    const request = new HttpRequest('GET', '/api/test');
    const httpError = new HttpErrorResponse({
      error: new ErrorEvent('Network error'),
      status: 0,
      statusText: 'Unknown Error',
    });

    mockHandler.and.returnValue(throwError(() => httpError));

    errorInterceptor(request, mockHandler).subscribe({
      next: () => fail('should have failed'),
      error: error => {
        expect(error.message).toContain('Unable to connect to server');
      },
    });
  });

  it('should handle server errors with custom message', () => {
    const request = new HttpRequest('GET', '/api/test');
    const httpError = new HttpErrorResponse({
      error: { message: 'Custom server error' },
      status: 400,
      statusText: 'Bad Request',
    });

    mockHandler.and.returnValue(throwError(() => httpError));

    errorInterceptor(request, mockHandler).subscribe({
      next: () => fail('should have failed'),
      error: error => {
        expect(error.message).toContain('Custom server error');
      },
    });
  });

  it('should handle errors without message', () => {
    const request = new HttpRequest('GET', '/api/test');
    const httpError = new HttpErrorResponse({
      error: {},
      status: 500,
      statusText: 'Internal Server Error',
    });

    mockHandler.and.returnValue(throwError(() => httpError));

    errorInterceptor(request, mockHandler).subscribe({
      next: () => fail('should have failed'),
      error: error => {
        expect(error.message).toContain('Internal server error');
      },
    });
  });

  it('should handle unknown status codes', () => {
    const request = new HttpRequest('GET', '/api/test');
    const httpError = new HttpErrorResponse({
      error: { message: 'Unknown error' },
      status: 418,
      statusText: "I'm a teapot",
    });

    mockHandler.and.returnValue(throwError(() => httpError));

    errorInterceptor(request, mockHandler).subscribe({
      next: () => fail('should have failed'),
      error: error => {
        expect(error.message).toContain('Server Error: 418 - I\'m a teapot');
      },
    });
  });

  it('should log errors to console', () => {
    spyOn(console, 'error');
    const request = new HttpRequest('GET', '/api/test');
    const httpError = new HttpErrorResponse({
      error: { message: 'Test error' },
      status: 500,
      statusText: 'Internal Server Error',
    });

    mockHandler.and.returnValue(throwError(() => httpError));

    errorInterceptor(request, mockHandler).subscribe({
      next: () => fail('should have failed'),
      error: () => {
        expect(console.error).toHaveBeenCalledWith('HTTP Error:', httpError);
      },
    });
  });

  it('should create new Error with formatted message', () => {
    const request = new HttpRequest('GET', '/api/test');
    const httpError = new HttpErrorResponse({
      error: { message: 'Original error' },
      status: 400,
      statusText: 'Bad Request',
    });

    mockHandler.and.returnValue(throwError(() => httpError));

    errorInterceptor(request, mockHandler).subscribe({
      next: () => fail('should have failed'),
      error: error => {
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toBe('Original error');
      },
    });
  });
});