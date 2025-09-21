import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService, User } from '../../services/auth.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard-container">
      <header class="dashboard-header">
        <h1>Dashboard</h1>
        <div class="user-info">
          <span>Welcome, {{ currentUser?.first_name }} {{ currentUser?.last_name }}!</span>
          <button class="btn btn-secondary" (click)="logout()">Logout</button>
        </div>
      </header>

      <main class="dashboard-main">
        <div class="user-profile">
          <h2>Your Profile</h2>
          <div class="profile-card">
            <div class="profile-field">
              <label>Email:</label>
              <span>{{ currentUser?.email }}</span>
            </div>
            <div class="profile-field">
              <label>Username:</label>
              <span>{{ currentUser?.username }}</span>
            </div>
            <div class="profile-field">
              <label>Name:</label>
              <span>{{ currentUser?.first_name }} {{ currentUser?.last_name }}</span>
            </div>
            <div class="profile-field">
              <label>Status:</label>
              <span [class]="currentUser?.is_active ? 'status-active' : 'status-inactive'">
                {{ currentUser?.is_active ? 'Active' : 'Inactive' }}
              </span>
            </div>
            <div class="profile-field">
              <label>Member since:</label>
              <span>{{ currentUser?.created_at | date:'medium' }}</span>
            </div>
          </div>
        </div>

        <div class="users-section">
          <h2>All Users</h2>
          <div class="users-controls">
            <button class="btn btn-primary" (click)="loadUsers()" [disabled]="isLoadingUsers">
              {{ isLoadingUsers ? 'Loading...' : 'Refresh Users' }}
            </button>
          </div>
          
          <div *ngIf="users.length > 0" class="users-list">
            <div *ngFor="let user of users" class="user-card">
              <div class="user-info">
                <h3>{{ user.first_name }} {{ user.last_name }}</h3>
                <p>{{ user.email }}</p>
                <p>@{{ user.username }}</p>
                <span [class]="user.is_active ? 'status-active' : 'status-inactive'">
                  {{ user.is_active ? 'Active' : 'Inactive' }}
                </span>
              </div>
            </div>
          </div>

          <div *ngIf="users.length === 0 && !isLoadingUsers" class="no-users">
            <p>No users found.</p>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .dashboard-container {
      min-height: 100vh;
      background-color: #f5f5f5;
    }

    .dashboard-header {
      background: white;
      padding: 1rem 2rem;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .dashboard-header h1 {
      margin: 0;
      color: #333;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .user-info span {
      color: #666;
    }

    .dashboard-main {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .user-profile, .users-section {
      background: white;
      padding: 1.5rem;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      margin-bottom: 2rem;
    }

    .user-profile h2, .users-section h2 {
      margin-top: 0;
      color: #333;
      border-bottom: 2px solid #007bff;
      padding-bottom: 0.5rem;
    }

    .profile-card {
      display: grid;
      gap: 1rem;
    }

    .profile-field {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.5rem 0;
      border-bottom: 1px solid #eee;
    }

    .profile-field:last-child {
      border-bottom: none;
    }

    .profile-field label {
      font-weight: 500;
      color: #555;
    }

    .status-active {
      color: #28a745;
      font-weight: 500;
    }

    .status-inactive {
      color: #dc3545;
      font-weight: 500;
    }

    .users-controls {
      margin-bottom: 1rem;
    }

    .users-list {
      display: grid;
      gap: 1rem;
    }

    .user-card {
      background: #f8f9fa;
      padding: 1rem;
      border-radius: 4px;
      border-left: 4px solid #007bff;
    }

    .user-card h3 {
      margin: 0 0 0.5rem 0;
      color: #333;
    }

    .user-card p {
      margin: 0.25rem 0;
      color: #666;
    }

    .no-users {
      text-align: center;
      color: #666;
      padding: 2rem;
    }

    .btn {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.875rem;
      transition: background-color 0.3s;
    }

    .btn-primary {
      background-color: #007bff;
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background-color: #0056b3;
    }

    .btn-primary:disabled {
      background-color: #6c757d;
      cursor: not-allowed;
    }

    .btn-secondary {
      background-color: #6c757d;
      color: white;
    }

    .btn-secondary:hover {
      background-color: #545b62;
    }
  `]
})
export class DashboardComponent implements OnInit {
  currentUser: User | null = null;
  users: User[] = [];
  isLoadingUsers = false;

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoadingUsers = true;
    this.userService.getUsers(20, 0).subscribe({
      next: (response) => {
        if (response.success) {
          this.users = response.data.users;
        }
      },
      error: (error) => {
        console.error('Error loading users:', error);
      },
      complete: () => {
        this.isLoadingUsers = false;
      }
    });
  }

  logout(): void {
    this.authService.logout();
  }
}
