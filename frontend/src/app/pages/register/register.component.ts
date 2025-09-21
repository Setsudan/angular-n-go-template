import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService, RegisterRequest, BackendApiResponse, User } from '../../services/auth.service';
import { LoadingSpinnerComponent } from '../../components/shared/loading-spinner.component';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, LoadingSpinnerComponent],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly registerForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  private readonly REDIRECT_DELAY = 2000;

  constructor() {
    this.registerForm = this.createRegisterForm();
  }

  private createRegisterForm(): FormGroup {
    return this.fb.group(
      {
        email: ['', [Validators.required, Validators.email]],
        username: ['', [Validators.required, Validators.minLength(3)]],
        firstName: ['', Validators.required],
        lastName: ['', Validators.required],
        password: ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', Validators.required],
      },
      { validators: this.passwordMatchValidator }
    );
  }

  private passwordMatchValidator(form: AbstractControl): ValidationErrors | null {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');

    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }

    if (confirmPassword?.hasError('passwordMismatch')) {
      confirmPassword.setErrors(null);
    }

    return null;
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.handleRegistration();
    }
  }

  private handleRegistration(): void {
    this.isLoading = true;
    this.clearMessages();

    const userData = this.buildRegisterRequest();

    this.authService.register(userData).subscribe({
      next: response => this.handleRegistrationSuccess(response),
      error: error => this.handleRegistrationError(error),
    });
  }

  private buildRegisterRequest(): RegisterRequest {
    const formValue = this.registerForm.value;
    return {
      email: formValue.email,
      username: formValue.username,
      first_name: formValue.firstName,
      last_name: formValue.lastName,
      password: formValue.password,
    };
  }

  private clearMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }

  private handleRegistrationSuccess(response: BackendApiResponse<User>): void {
    // Backend returns: { requestId, timestamp, data: { user }, status: "success" }
    if (response.status === 'success' && response.data) {
      this.isLoading = false;
      this.successMessage = 'Account created successfully! Please login.';
      this.redirectToLogin();
    } else {
      this.isLoading = false;
      this.errorMessage = 'Registration failed. Please try again.';
    }
  }

  private handleRegistrationError(error: { message?: string }): void {
    this.isLoading = false;
    this.errorMessage = error.message || 'Registration failed. Please try again.';
    console.error('Registration error:', error);
  }

  private redirectToLogin(): void {
    setTimeout(() => {
      this.router.navigate(['/login']);
    }, this.REDIRECT_DELAY);
  }
}
