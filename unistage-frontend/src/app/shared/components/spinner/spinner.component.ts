import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="spinner" [class]="'spinner-' + size" [attr.aria-label]="label"></span>
  `,
  styles: [`
    .spinner {
      display: inline-block;
      border-style: solid;
      border-color: currentColor transparent currentColor transparent;
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
      flex-shrink: 0;
    }
    .spinner-xs  { width: 14px; height: 14px; border-width: 2px; }
    .spinner-sm  { width: 18px; height: 18px; border-width: 2.5px; }
    .spinner-md  { width: 26px; height: 26px; border-width: 3px; }
    .spinner-lg  { width: 40px; height: 40px; border-width: 4px; }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `]
})
export class SpinnerComponent {
  size: 'xs' | 'sm' | 'md' | 'lg' = 'sm';
  label = 'Chargement...';
}
