import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
@Component({
  selector: 'ngx-assessment-wizard-controls',
  imports: [MatButtonModule, MatIconModule],
  template: ` <nav
      class="assessment-wizard-controls__steps"
      aria-label="Assessment steps"
    >
      <button
        mat-stroked-button
        class="assessment-wizard-controls__step"
        [class.assessment-wizard-controls__step--active]="
          step() === 0
        "
        [attr.aria-current]="step() === 0 ? 'step' : null"
        (click)="stepChange.emit(0)"
      >
        <span class="assessment-wizard-controls__step-num">1</span>
        Basics
      </button>
      <button
        mat-stroked-button
        class="assessment-wizard-controls__step"
        [class.assessment-wizard-controls__step--active]="
          step() === 1
        "
        [attr.aria-current]="step() === 1 ? 'step' : null"
        (click)="stepChange.emit(1)"
      >
        <span class="assessment-wizard-controls__step-num">2</span>
        Questions
      </button>
      <button
        mat-stroked-button
        class="assessment-wizard-controls__step"
        [class.assessment-wizard-controls__step--active]="
          step() === 2
        "
        [attr.aria-current]="step() === 2 ? 'step' : null"
        (click)="stepChange.emit(2)"
      >
        <span class="assessment-wizard-controls__step-num">3</span>
        Review
      </button>
    </nav>
    <ng-content />
    <footer class="assessment-wizard-controls__footer">
      <div class="assessment-wizard-controls__footer-left">
        <button
          mat-stroked-button
          (click)="previous.emit()"
          [disabled]="step() === 0"
        >
          Back
        </button>
      </div>
      <div class="assessment-wizard-controls__footer-right">
        @if (step() < 2) {
          <button
            mat-flat-button
            color="primary"
            (click)="next.emit()"
          >
            {{ step() === 0 ? 'Build questions' : 'Review assessment'
            }}<mat-icon>arrow_forward</mat-icon>
          </button>
        } @else {
          <button
            mat-flat-button
            color="primary"
            [disabled]="invalid() || saving()"
            (click)="save.emit()"
          >
            {{
              saving()
                ? 'Saving…'
                : mode() === 'create'
                  ? 'Create test'
                  : 'Save changes'
            }}
          </button>
        }
      </div>
    </footer>`,
  styles: [
    `
      :host {
        display: grid;
        gap: 1.5rem;
        min-width: 0;
      }
      .assessment-wizard-controls__steps {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 0.5rem;
        background: var(--mat-sys-surface-container-low);
        padding: 0.5rem;
        border-radius: 14px;
      }
      .assessment-wizard-controls__steps button {
        border-color: transparent;
        border-radius: 10px;
        height: 48px;
        color: var(--mat-sys-on-surface-variant);
      }
      .assessment-wizard-controls__steps
        button.assessment-wizard-controls__step--active {
        color: var(--mat-sys-on-secondary-container);
        background: var(--mat-sys-secondary-container);
      }
      .assessment-wizard-controls__step-num {
        display: inline-grid;
        place-items: center;
        width: 24px;
        height: 24px;
        margin-right: 0.5rem;
        border-radius: 50%;
        border: 1px solid currentColor;
        font-size: 0.75rem;
      }
      .assessment-wizard-controls__footer {
        flex-wrap: wrap;
        position: sticky;
        bottom: 0;
        z-index: 3;
        display: flex;
        justify-content: space-between;
        gap: 1rem;
        padding: 1rem;
        border: 1px solid var(--mat-sys-outline-variant);
        border-radius: 14px;
        background: var(--mat-sys-surface-container);
        box-shadow: 0 -4px 20px #00000012;
      }
      @media (max-width: 480px) {
        .assessment-wizard-controls__steps {
          gap: 0;
          padding: 0.25rem;
        }
        .assessment-wizard-controls__steps button {
          font-size: 0.75rem;
          padding: 0 0.25rem;
        }
        .assessment-wizard-controls__step-num {
          width: 18px;
          height: 18px;
          margin-right: 0.2rem;
        }
        .assessment-wizard-controls__footer {
          padding: 0.75rem 0.5rem;
          gap: 0.5rem;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssessmentWizardControlsComponent {
  readonly mode = input.required<'create' | 'edit'>();
  readonly step = input.required<number>();
  readonly saving = input.required<boolean>();
  readonly invalid = input.required<boolean>();
  readonly stepChange = output<number>();
  readonly previous = output<void>();
  readonly next = output<void>();
  readonly save = output<void>();
}
