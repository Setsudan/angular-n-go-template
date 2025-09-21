import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { UserService, UserListResponse } from './user.service';
import { User, ApiResponse } from './auth.service';
import { environment } from '../../environments/environment';

describe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;

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

  const mockUserList: UserListResponse = {
    users: [mockUser],
    total: 1,
    limit: 10,
    offset: 0,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [UserService],
    });

    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getUsers', () => {
    it('should get users with default parameters', () => {
      const mockApiResponse: ApiResponse<UserListResponse> = {
        success: true,
        data: mockUserList,
        message: 'Users retrieved successfully',
        request_id: 'test-request-id',
      };

      service.getUsers().subscribe(response => {
        expect(response).toEqual(mockApiResponse);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/users?limit=10&offset=0`);
      expect(req.request.method).toBe('GET');
      req.flush(mockApiResponse);
    });

    it('should get users with custom parameters', () => {
      const mockApiResponse: ApiResponse<UserListResponse> = {
        success: true,
        data: mockUserList,
        message: 'Users retrieved successfully',
        request_id: 'test-request-id',
      };

      service.getUsers(20, 10).subscribe(response => {
        expect(response).toEqual(mockApiResponse);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/users?limit=20&offset=10`);
      expect(req.request.method).toBe('GET');
      req.flush(mockApiResponse);
    });

    it('should handle getUsers failure', () => {
      service.getUsers().subscribe({
        next: () => fail('should have failed'),
        error: error => {
          expect(error.message).toContain('An unexpected error occurred');
        },
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/users?limit=10&offset=0`);
      req.flush({ message: 'Server error' }, { status: 500, statusText: 'Internal Server Error' });
    });
  });

  describe('getUser', () => {
    it('should get user by id', () => {
      const mockApiResponse: ApiResponse<User> = {
        success: true,
        data: mockUser,
        message: 'User retrieved successfully',
        request_id: 'test-request-id',
      };

      service.getUser('1').subscribe(response => {
        expect(response).toEqual(mockApiResponse);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/users/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockApiResponse);
    });

    it('should handle getUser failure', () => {
      service.getUser('1').subscribe({
        next: () => fail('should have failed'),
        error: error => {
          expect(error.message).toContain('User not found');
        },
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/users/1`);
      req.flush({ message: 'User not found' }, { status: 404, statusText: 'Not Found' });
    });
  });

  describe('updateUser', () => {
    it('should update user successfully', () => {
      const updateData: Partial<User> = {
        first_name: 'Updated',
        last_name: 'Name',
      };

      const updatedUser: User = {
        ...mockUser,
        ...updateData,
        updated_at: '2023-01-02T00:00:00Z',
      };

      const mockApiResponse: ApiResponse<User> = {
        success: true,
        data: updatedUser,
        message: 'User updated successfully',
        request_id: 'test-request-id',
      };

      service.updateUser('1', updateData).subscribe(response => {
        expect(response).toEqual(mockApiResponse);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/users/1`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updateData);
      req.flush(mockApiResponse);
    });

    it('should handle updateUser failure', () => {
      const updateData: Partial<User> = {
        first_name: 'Updated',
      };

      service.updateUser('1', updateData).subscribe({
        next: () => fail('should have failed'),
        error: error => {
          expect(error.message).toContain('An unexpected error occurred');
        },
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/users/1`);
      req.flush({ message: 'Update failed' }, { status: 400, statusText: 'Bad Request' });
    });
  });

  describe('deleteUser', () => {
    it('should delete user successfully', () => {
      const mockApiResponse: ApiResponse<{ message: string }> = {
        success: true,
        data: { message: 'User deleted successfully' },
        message: 'User deleted successfully',
        request_id: 'test-request-id',
      };

      service.deleteUser('1').subscribe(response => {
        expect(response).toEqual(mockApiResponse);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/users/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(mockApiResponse);
    });

    it('should handle deleteUser failure', () => {
      service.deleteUser('1').subscribe({
        next: () => fail('should have failed'),
        error: error => {
          expect(error.message).toContain('User not found');
        },
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/users/1`);
      req.flush({ message: 'User not found' }, { status: 404, statusText: 'Not Found' });
    });
  });

  describe('handleError', () => {
    it('should handle client-side errors', () => {
      const clientError = new ErrorEvent('Client Error', {
        message: 'Network error',
      });

      service.getUsers().subscribe({
        next: () => fail('should have failed'),
        error: error => {
          expect(error.message).toContain('Client Error: Network error');
        },
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/users?limit=10&offset=0`);
      req.error(clientError);
    });

    it('should handle 401 errors', () => {
      service.getUsers().subscribe({
        next: () => fail('should have failed'),
        error: error => {
          expect(error.message).toContain('Authentication failed');
        },
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/users?limit=10&offset=0`);
      req.flush({ message: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });
    });

    it('should handle 403 errors', () => {
      service.getUsers().subscribe({
        next: () => fail('should have failed'),
        error: error => {
          expect(error.message).toContain('Access denied');
        },
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/users?limit=10&offset=0`);
      req.flush({ message: 'Forbidden' }, { status: 403, statusText: 'Forbidden' });
    });

    it('should handle 404 errors', () => {
      service.getUsers().subscribe({
        next: () => fail('should have failed'),
        error: error => {
          expect(error.message).toContain('User not found');
        },
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/users?limit=10&offset=0`);
      req.flush({ message: 'Not Found' }, { status: 404, statusText: 'Not Found' });
    });

    it('should handle 500 errors', () => {
      service.getUsers().subscribe({
        next: () => fail('should have failed'),
        error: error => {
          expect(error.message).toContain('Internal server error');
        },
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/users?limit=10&offset=0`);
      req.flush(
        { message: 'Internal Server Error' },
        { status: 500, statusText: 'Internal Server Error' }
      );
    });

    it('should handle connection errors', () => {
      service.getUsers().subscribe({
        next: () => fail('should have failed'),
        error: error => {
          expect(error.message).toContain('Unable to connect to server');
        },
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/users?limit=10&offset=0`);
      req.error(new ErrorEvent('Network error'));
    });

    it('should handle server errors with custom message', () => {
      service.getUsers().subscribe({
        next: () => fail('should have failed'),
        error: error => {
          expect(error.message).toContain('Custom server error');
        },
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/users?limit=10&offset=0`);
      req.flush({ message: 'Custom server error' }, { status: 400, statusText: 'Bad Request' });
    });
  });
});
