import { NgxButton } from '@tmdjr/ngx-workshop-design-system';
import {
  ChangeDetectionStrategy,
  Component,
  output,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'ngx-assessment-test-list-empty-state',
  imports: [NgxButton,MatButtonModule, MatIconModule],
  template: `
    <div class="assessment-empty__empty">
      <mat-icon>inbox</mat-icon>
      <h3>Your assessment library starts here</h3>
      <p>
        Create a test with questions, answer choices and helpful
        feedback.
      </p>
      <button mat-flat-button ngxButton surface="outline" color="primary" (click)="create.emit()">
        <mat-icon>add</mat-icon>
        Create your first assessment
      </button>
    </div>
  `,
  styles: [
    `
      .assessment-empty__empty {
        display: grid;
        gap: 0.75rem;
        justify-items: center;
        padding: 2rem 0;
        text-align: center;
        border: 1px dashed var(--ngx-color-border);
        border-radius: 16px;
      }
      h3,
      p {
        margin: 0;
      }
      p {
        color: var(--ngx-color-muted);
      }
      .assessment-empty__empty > mat-icon {
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
