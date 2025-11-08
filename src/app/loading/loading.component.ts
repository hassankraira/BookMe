
import { LoadingService } from './../loading.service';
// loading.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [CommonModule, NgIf],
  template: `
     <div *ngIf="loadingService.loading$  | async" class="loading-section">
      <div class="spinner"></div>
    </div>
  `,
  styles: [`
     .loading-section {
      position: fixed;
      top: 0%;
      left: 0;
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      background-color: rgba(0, 0, 0, 0.5); 
      border-radius: inherit;
      z-index: 10000;
    }

    .spinner {
      width: 60px;
      height: 60px;
      border: 5px solid transparent;
      border-top: 5px solid transparent;
      border-radius: 50%;
      background: linear-gradient(135deg, #fa8604, #f900d1);
      background-clip: border-box;
      mask: radial-gradient(farthest-side, transparent calc(100% - 6px), black 0);
      -webkit-mask: radial-gradient(farthest-side, transparent calc(100% - 6px), black 0);
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `]
})
export class LoadingComponent {
  constructor(public loadingService: LoadingService) {}
}
