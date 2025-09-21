import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { User, BackendApiResponse } from './auth.service';
import { environment } from '../../environments/environment';

export interface UserListResponse {
  users: User[];
  total: number;
  limit: number;
  offset: number;
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly API_URL = environment.apiUrl;

  getUsers(limit: number = 10, offset: number = 0): Observable<BackendApiResponse<UserListResponse>> {
    const params = new HttpParams().set('limit', limit.toString()).set('offset', offset.toString());

    return this.http
      .get<BackendApiResponse<UserListResponse>>(`${this.API_URL}/users`, { params })
      .pipe(catchError(this.handleError));
  }

  getUser(id: string): Observable<BackendApiResponse<User>> {
    return this.http
      .get<BackendApiResponse<User>>(`${this.API_URL}/users/${id}`)
      .pipe(catchError(this.handleError));
  }

  updateUser(id: string, userData: Partial<User>): Observable<BackendApiResponse<User>> {
    return this.http
      .put<BackendApiResponse<User>>(`${this.API_URL}/users/${id}`, userData)
      .pipe(catchError(this.handleError));
  }

  deleteUser(id: string): Observable<BackendApiResponse<{ message: string }>> {
    return this.http
      .delete<BackendApiResponse<{ message: string }>>(`${this.API_URL}/users/${id}`)
      .pipe(catchError(this.handleError));
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
      } else if (error.status === 403) {
        errorMessage = 'Access denied. You do not have permission to perform this action.';
      } else if (error.status === 404) {
        errorMessage = 'User not found.';
      } else if (error.status === 500) {
        errorMessage = 'Internal server error. Please try again later.';
      } else {
        errorMessage = `Server Error: ${error.status} - ${error.statusText}`;
      }
    }

    console.error('User Service Error:', error);
    return throwError(() => new Error(errorMessage));
  };
}
