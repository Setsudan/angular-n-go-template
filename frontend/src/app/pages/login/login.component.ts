import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService, LoginRequest, BackendApiResponse, LoginResponse } from '../../services/auth.service';
import { LoadingSpinnerComponent } from '../../components/shared/loading-spinner.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, LoadingSpinnerComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor() {
    this.loginForm = this.createLoginForm();
  }

  private createLoginForm(): FormGroup {
    return this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.handleLogin();
    }
  }

  private handleLogin(): void {
    this.isLoading = true;
    this.errorMessage = '';

    const credentials: LoginRequest = this.loginForm.value;

    this.authService.login(credentials).subscribe({
      next: response => this.handleLoginSuccess(response),
      error: error => this.handleLoginError(error),
    });
  }

  private handleLoginSuccess(response: BackendApiResponse<LoginResponse>): void {
    this.isLoading = false;
    if (response.status === 'success' && response.data) {
      this.router.navigate(['/dashboard']);
    } else {
      this.errorMessage = 'Login failed. Please try again.';
    }
  }

  private handleLoginError(error: { message?: string }): void {
    this.isLoading = false;
    this.errorMessage = error.message || 'Login failed. Please try again.';
    console.error('Login error:', error);
  }
}
