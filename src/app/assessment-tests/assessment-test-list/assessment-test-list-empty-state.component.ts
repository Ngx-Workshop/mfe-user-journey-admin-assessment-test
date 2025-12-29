import {
  ChangeDetectionStrategy,
  Component,
  output,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'ngx-assessment-test-list-empty-state',
  imports: [MatButtonModule, MatIconModule],
  template: `
    <div class="empty">
      <mat-icon>inbox</mat-icon>
      <p>No assessment tests match your filter.</p>
      <button mat-flat-button color="primary" (click)="create.emit()">
        <mat-icon>add</mat-icon>
        Add your first test
      </button>
    </div>
  `,
  styles: [
    `
      .empty {
        display: grid;
        gap: 0.75rem;
        justify-items: center;
        padding: 2rem 0;
        opacity: 0.75;
      }
      .empty mat-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssessmentTestListEmptyStateComponent {
  readonly create = output<void>();
}
