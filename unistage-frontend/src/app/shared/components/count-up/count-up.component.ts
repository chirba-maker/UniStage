import { Component, Input, OnInit, OnChanges, SimpleChanges, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-count-up',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="count-up-number">{{ displayValue() }}{{ suffix }}</span>
  `,
  styles: [`
    .count-up-number {
      display: inline-block;
      font-variant-numeric: tabular-nums;
      letter-spacing: -0.03em;
      transition: color 0.3s ease;
    }
  `]
})
export class CountUpComponent {
  private _target: number = 0;
  @Input() set target(val: number | undefined | null) {
    this._target = Number(val) || 0;
    this.animateCount();
  }
  get target(): number {
    return this._target;
  }

  @Input() durationMs: number = 1200;
  @Input() suffix: string = '';

  displayValue = signal<number>(0);
  private animFrameId?: number;

  private animateCount(): void {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
    }

    const startVal = this.displayValue();
    const endVal = Number(this.target) || 0;
    const startTime = performance.now();
    const duration = this.durationMs;

    if (startVal === endVal) {
      this.displayValue.set(endVal);
      return;
    }

    const easeOutExpo = (x: number): number => {
      return x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
    };

    const update = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutExpo(progress);

      const current = Math.round(startVal + (endVal - startVal) * easedProgress);
      this.displayValue.set(current);

      if (progress < 1) {
        this.animFrameId = requestAnimationFrame(update);
      } else {
        this.displayValue.set(endVal);
      }
    };

    this.animFrameId = requestAnimationFrame(update);
  }
}
