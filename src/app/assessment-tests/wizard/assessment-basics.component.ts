import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { AssessmentTestForm } from '../../services/assessment-test-form.service';

@Component({
  selector: 'ngx-assessment-basics',
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  template: `
    <mat-card class="assessment-basics__panel">
      <mat-card-header>
        <mat-card-title>Basics</mat-card-title>
        <mat-card-subtitle
          >Give your assessment a name and a place in the learning journey.</mat-card-subtitle
        >
      </mat-card-header>
      <mat-card-content>
        <form [formGroup]="form()" class="assessment-basics__grid">
          <mat-form-field appearance="outline" class="assessment-basics__full">
            <mat-label>Name</mat-label>
            <input matInput formControlName="name" required />
            @if (form().controls.name.hasError('required')) {
              <mat-error>Required</mat-error>
            }
            @if (form().controls.name.hasError('maxlength')) {
              <mat-error>Too long</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Subject</mat-label>
            <mat-select formControlName="subject" required>
              @for (s of subjects; track s) {
                <mat-option [value]="s">{{ s }}</mat-option>
              }
            </mat-select>
            @if (form().controls.subject.hasError('required')) {
              <mat-error>Pick a subject</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Level</mat-label>
            <input matInput type="number" min="1" formControlName="level" required />
            @if (form().controls.level.invalid) {
              <mat-error>Enter a whole number of at least 1</mat-error>
            }
          </mat-form-field>
        </form>
        <p class="assessment-basics__hint">
          Tests with learner attempts cannot be changed or deleted.
        </p>
      </mat-card-content>
    </mat-card>
  `,
  styles: [
    `
      :host {
        display: block;
        min-width: 0;
      }
      .assessment-basics__hint {
        color: var(--mat-sys-on-surface-variant);
        font-size: 0.9rem;
        margin: 0;
        line-height: 1.6;
      }
      .assessment-basics__panel {
        padding: 1rem;
        border: 1px solid var(--mat-sys-outline-variant);
        border-radius: 16px;
        box-shadow: none;
      }
      .assessment-basics__grid {
        display: grid;
        grid-template-columns: minmax(0, 1fr) minmax(150px, 0.6fr) 130px;
        gap: 1rem;
        padding-top: 1.5rem;
      }
      mat-form-field {
        min-width: 0;
        width: 100%;
      }
      @media (max-width: 850px) {
        .assessment-basics__grid {
          grid-template-columns: 1fr;
        }
        .assessment-basics__panel {
          padding: 0.25rem;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssessmentBasicsComponent {
  readonly form = input.required<AssessmentTestForm>();
  readonly subjects = ['ANGULAR', 'NESTJS', 'RXJS'] as const;
}
