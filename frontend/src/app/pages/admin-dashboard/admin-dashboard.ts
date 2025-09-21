import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { AdminService, RequestLog, SystemStats } from '../../services/admin.service';
import { AuthService, User } from '../../services/auth.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.scss'
})
export class AdminDashboard implements OnInit {
  private readonly adminService = inject(AdminService);
  private readonly authService = inject(AuthService);

  currentUser$: Observable<User | null> = this.authService.currentUser$;
  isInitialized$: Observable<boolean> = this.authService.isInitialized$;
  
  requestLogs: RequestLog[] = [];
  systemStats: SystemStats | null = null;
  loading = false;
  error: string | null = null;
  selectedTab: 'logs' | 'stats' = 'logs';
  logsLimit = 100;
  userLogsLimit = 50;
  selectedUserId = '';

  ngOnInit(): void {
    this.loadSystemStats();
    this.loadRequestLogs();
  }

  loadRequestLogs(): void {
    this.loading = true;
    this.error = null;

    this.adminService.getRequestLogs(this.logsLimit).subscribe({
      next: (response) => {
        if (response.status === 'success' && response.data) {
          this.requestLogs = response.data.logs;
        }
        this.loading = false;
      },
      error: (error) => {
        this.error = error.message;
        this.loading = false;
      }
    });
  }

  loadSystemStats(): void {
    this.adminService.getSystemStats().subscribe({
      next: (response) => {
        if (response.status === 'success' && response.data) {
          this.systemStats = response.data;
        }
      },
      error: (error) => {
        console.error('Failed to load system stats:', error);
      }
    });
  }

  loadUserLogs(): void {
    if (!this.selectedUserId) return;

    this.loading = true;
    this.error = null;

    this.adminService.getRequestLogsByUser(this.selectedUserId, this.userLogsLimit).subscribe({
      next: (response) => {
        if (response.status === 'success' && response.data) {
          this.requestLogs = response.data.logs;
        }
        this.loading = false;
      },
      error: (error) => {
        this.error = error.message;
        this.loading = false;
      }
    });
  }

  setTab(tab: 'logs' | 'stats'): void {
    this.selectedTab = tab;
  }

  getStatusClass(statusCode: number): string {
    if (statusCode >= 200 && statusCode < 300) return 'status-success';
    if (statusCode >= 300 && statusCode < 400) return 'status-redirect';
    if (statusCode >= 400 && statusCode < 500) return 'status-client-error';
    if (statusCode >= 500) return 'status-server-error';
    return 'status-unknown';
  }

  getMethodClass(method: string): string {
    return `method-${method.toLowerCase()}`;
  }

  formatTimestamp(timestamp: string): string {
    return new Date(timestamp).toLocaleString();
  }

  getCurrentUser() {
    return this.authService.getCurrentUser();
  }
}
