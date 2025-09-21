import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

export interface RequestLog {
  id: string;
  request_id: string;
  method: string;
  path: string;
  ip_address: string;
  user_agent: string;
  user_id?: string;
  status_code: number;
  response_time_ms: number;
  timestamp: string;
  error?: string;
}

export interface RequestLogsResponse {
  logs: RequestLog[];
  count: number;
  limit: number;
}

export interface UserLogsResponse {
  logs: RequestLog[];
  count: number;
  limit: number;
  user_id: string;
}

export interface SystemStats {
  total_requests: number;
  status_codes: { [key: number]: number };
  methods: { [key: string]: number };
  top_paths: { [key: string]: number };
  timestamp: string;
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

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private readonly http = inject(HttpClient);
  private readonly API_URL = environment.apiUrl;

  getRequestLogs(limit: number = 100): Observable<BackendApiResponse<RequestLogsResponse>> {
    return this.http
      .get<BackendApiResponse<RequestLogsResponse>>(`${this.API_URL}/admin/logs?limit=${limit}`)
      .pipe(catchError(this.handleError));
  }

  getRequestLogsByUser(userId: string, limit: number = 50): Observable<BackendApiResponse<UserLogsResponse>> {
    return this.http
      .get<BackendApiResponse<UserLogsResponse>>(`${this.API_URL}/admin/logs/user/${userId}?limit=${limit}`)
      .pipe(catchError(this.handleError));
  }

  getSystemStats(): Observable<BackendApiResponse<SystemStats>> {
    return this.http
      .get<BackendApiResponse<SystemStats>>(`${this.API_URL}/admin/stats`)
      .pipe(catchError(this.handleError));
  }

  private handleError = (error: HttpErrorResponse): Observable<never> => {
    let errorMessage = 'An unexpected error occurred';

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Client Error: ${error.error.message}`;
    } else {
      if (error.error && error.error.message) {
        errorMessage = error.error.message;
      } else if (error.status === 0) {
        errorMessage = 'Unable to connect to server. Please check your internet connection.';
      } else if (error.status === 401) {
        errorMessage = 'Authentication failed. Please login again.';
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

    console.error('Admin Service Error:', error);
    return throwError(() => new Error(errorMessage));
  };
}
