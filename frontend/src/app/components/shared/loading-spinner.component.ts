import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="spinner" [class.small]="size === 'small'" [class.large]="size === 'large'">
      <div class="spinner-inner"></div>
    </div>
  `,
  styles: [
    `
      .spinner {
        display: inline-block;
        width: 20px;
        height: 20px;
        border: 2px solid #f3f3f3;
        border-top: 2px solid #007bff;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }

      .spinner.small {
        width: 16px;
        height: 16px;
        border-width: 1px;
      }

      .spinner.large {
        width: 32px;
        height: 32px;
        border-width: 3px;
      }

      @keyframes spin {
        0% {
          transform: rotate(0deg);
        }
        100% {
          transform: rotate(360deg);
        }
      }
    `,
  ],
})
export class LoadingSpinnerComponent {
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
}
