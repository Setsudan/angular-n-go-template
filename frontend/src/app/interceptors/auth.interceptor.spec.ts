import { TestBed } from '@angular/core/testing';
import { HttpRequest, HttpEvent } from '@angular/common/http';
import { of } from 'rxjs';
import { authInterceptor } from './auth.interceptor';
import { AuthService } from '../services/auth.service';

describe('authInterceptor', () => {
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let mockHandler: jasmine.Spy;

  beforeEach(() => {
    const authSpy = jasmine.createSpyObj('AuthService', ['getToken']);

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authSpy },
      ],
    });

    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    mockHandler = jasmine.createSpy('HttpHandlerFn').and.returnValue(of({} as HttpEvent<unknown>));
  });

  it('should add Authorization header when token exists', () => {
    const token = 'mock-jwt-token';
    authServiceSpy.getToken.and.returnValue(token);

    const request = new HttpRequest('GET', '/api/test');

    authInterceptor(request, mockHandler).subscribe();

    expect(authServiceSpy.getToken).toHaveBeenCalled();
    expect(mockHandler).toHaveBeenCalledWith(
      jasmine.objectContaining({
        headers: jasmine.objectContaining({
          Authorization: `Bearer ${token}`,
        }),
      })
    );
  });

  it('should not add Authorization header when token does not exist', () => {
    authServiceSpy.getToken.and.returnValue(null);

    const request = new HttpRequest('GET', '/api/test');

    authInterceptor(request, mockHandler).subscribe();

    expect(authServiceSpy.getToken).toHaveBeenCalled();
    expect(mockHandler).toHaveBeenCalledWith(request);
  });

  it('should not add Authorization header when token is empty string', () => {
    authServiceSpy.getToken.and.returnValue('');

    const request = new HttpRequest('GET', '/api/test');

    authInterceptor(request, mockHandler).subscribe();

    expect(authServiceSpy.getToken).toHaveBeenCalled();
    expect(mockHandler).toHaveBeenCalledWith(request);
  });

  it('should preserve existing headers when adding Authorization', () => {
    const token = 'mock-jwt-token';
    authServiceSpy.getToken.and.returnValue(token);

    const request = new HttpRequest('GET', '/api/test', null, {
      headers: { 'Content-Type': 'application/json' } as any,
    });

    authInterceptor(request, mockHandler).subscribe();

    expect(mockHandler).toHaveBeenCalledWith(
      jasmine.objectContaining({
        headers: jasmine.objectContaining({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        }),
      })
    );
  });

  it('should handle different HTTP methods', () => {
    const token = 'mock-jwt-token';
    authServiceSpy.getToken.and.returnValue(token);

    const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'] as const;

    methods.forEach(method => {
      mockHandler.calls.reset();
      const request = new HttpRequest(method as any, '/api/test');

      authInterceptor(request, mockHandler).subscribe();

      expect(mockHandler).toHaveBeenCalledWith(
        jasmine.objectContaining({
          headers: jasmine.objectContaining({
            Authorization: `Bearer ${token}`,
          }),
        })
      );
    });
  });

  it('should handle different URLs', () => {
    const token = 'mock-jwt-token';
    authServiceSpy.getToken.and.returnValue(token);

    const urls = ['/api/users', '/api/auth/login', '/api/dashboard', 'https://external-api.com/data'];

    urls.forEach(url => {
      mockHandler.calls.reset();
      const request = new HttpRequest('GET', url);

      authInterceptor(request, mockHandler).subscribe();

      expect(mockHandler).toHaveBeenCalledWith(
        jasmine.objectContaining({
          headers: jasmine.objectContaining({
            Authorization: `Bearer ${token}`,
          }),
        })
      );
    });
  });

  it('should return the same observable from the handler', () => {
    const token = 'mock-jwt-token';
    authServiceSpy.getToken.and.returnValue(token);

    const request = new HttpRequest('GET', '/api/test');
    const mockObservable = of({} as HttpEvent<unknown>);
    mockHandler.and.returnValue(mockObservable);

    const result = authInterceptor(request, mockHandler);

    expect(result).toBe(mockObservable);
  });

  it('should call getToken for each request', () => {
    authServiceSpy.getToken.and.returnValue(null);

    const request1 = new HttpRequest('GET', '/api/test1');
    const request2 = new HttpRequest('POST' as any, '/api/test2');

    authInterceptor(request1, mockHandler).subscribe();
    authInterceptor(request2, mockHandler).subscribe();

    expect(authServiceSpy.getToken).toHaveBeenCalledTimes(2);
  });
});