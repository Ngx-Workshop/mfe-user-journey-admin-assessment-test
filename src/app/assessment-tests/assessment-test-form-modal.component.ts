import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AssessmentTestDto } from '@tmdjr/service-nestjs-assessment-test-contracts';
import { finalize } from 'rxjs';
import {
  AssessmentSubject,
  AssessmentTestForm,
  AssessmentTestFormService,
  TestQuestionForm,
} from '../services/assessment-test-form.service';
import { AssessmentTestsApiService } from '../services/assessment-tests-api.service';

export type AssessmentTestFormDialogData = {
  mode: 'create' | 'edit';
  test?: AssessmentTestDto;
};

@Component({
  selector: 'ngx-assessment-test-form-modal',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatTooltipModule,
    ReactiveFormsModule,
  ],
  template: `
    <header mat-dialog-title>
      {{
        data.mode === 'create'
          ? 'Create Assessment Test'
          : 'Edit Assessment Test'
      }}
    </header>
    <mat-dialog-content>
      <form [formGroup]="form" class="form">
        <div class="header-grid">
          <mat-form-field appearance="outline" class="full">
            <mat-label>Name</mat-label>
            <input matInput formControlName="name" required />
            @if(form.controls.name.hasError('required')) {
            <mat-error>Required</mat-error>
            } @if(form.controls.name.hasError('maxlength')) {
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
            @if(form.controls.subject.hasError('required')) {
            <mat-error>Subject is required</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Level</mat-label>
            <input
              matInput
              type="number"
              min="1"
              formControlName="level"
              required
            />
            @if(form.controls.level.hasError('min')) {
            <mat-error>Level must be at least 1</mat-error>
            }
          </mat-form-field>
        </div>

        <mat-divider></mat-divider>

        <section class="questions">
          <div class="section-header">
            <h3>Questions</h3>
            <button
              mat-stroked-button
              type="button"
              (click)="addQuestion()"
            >
              <mat-icon>add</mat-icon>
              Add question
            </button>
          </div>

          @for (q of questionControls(); track q; let i = $index) {
          <div class="question-card" [formGroup]="q">
            <div class="question-head">
              <h4>Question {{ i + 1 }}</h4>
              <button
                mat-icon-button
                type="button"
                (click)="removeQuestion(i)"
                [disabled]="questionControls().length <= 1"
                matTooltip="Remove question"
                aria-label="Remove question"
              >
                <mat-icon>delete</mat-icon>
              </button>
            </div>

            <mat-form-field appearance="outline" class="full">
              <mat-label>Prompt</mat-label>
              <textarea
                matInput
                formControlName="question"
                rows="3"
                required
              ></textarea>
              @if(q.controls.question.hasError('required')) {
              <mat-error>Required</mat-error>
              }
            </mat-form-field>

            <div formArrayName="choices" class="choices">
              <div class="choices-header">
                <h5>Choices</h5>
                <button
                  mat-button
                  type="button"
                  (click)="addChoice(q)"
                  matTooltip="Add choice"
                >
                  <mat-icon>add</mat-icon>
                  Add choice
                </button>
              </div>
              @for (c of q.controls.choices.controls; track c; let ci
              = $index) {
              <mat-form-field appearance="outline" class="choice">
                <mat-label>Choice {{ ci + 1 }}</mat-label>
                <input matInput [formControlName]="ci" />
                @if(q.controls.choices.length > 2) {
                <button
                  mat-icon-button
                  matSuffix
                  type="button"
                  (click)="removeChoice(q, ci)"
                  aria-label="Remove choice"
                >
                  <mat-icon>close</mat-icon>
                </button>
                }
              </mat-form-field>
              }
            </div>

            <div class="answers">
              <mat-form-field appearance="outline" class="full">
                <mat-label>Correct Answer</mat-label>
                <mat-select formControlName="answer" required>
                  @for (opt of q.controls.choices.controls; track opt;
                  let oi = $index) {
                  <mat-option [value]="opt.value">
                    Choice {{ oi + 1 }} — {{ opt.value }}
                  </mat-option>
                  }
                </mat-select>
                @if(q.controls.answer.hasError('required')) {
                <mat-error>Pick an answer</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline" class="full">
                <mat-label>Correct Response</mat-label>
                <textarea
                  matInput
                  formControlName="correctResponse"
                  rows="2"
                  required
                ></textarea>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full">
                <mat-label>Incorrect Response</mat-label>
                <textarea
                  matInput
                  formControlName="incorrectResponse"
                  rows="2"
                  required
                ></textarea>
              </mat-form-field>
            </div>
          </div>
          }
        </section>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button type="button" (click)="dialogRef.close()">
        Cancel
      </button>
      <button
        mat-flat-button
        color="primary"
        type="button"
        [disabled]="form.invalid || submitting()"
        (click)="submit()"
      >
        {{ data.mode === 'create' ? 'Create' : 'Save changes' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      .form {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        min-width: min(960px, 96vw);
      }
      .header-grid {
        display: grid;
        grid-template-columns: 1fr 240px 160px;
        gap: 0.75rem;
      }
      .full {
        width: 100%;
      }
      .section-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.5rem;
      }
      .questions {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }
      .question-card {
        border: 1px solid rgba(0, 0, 0, 0.08);
        border-radius: 12px;
        padding: 0.75rem 0.75rem 1rem;
        background: rgba(0, 0, 0, 0.02);
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }
      .question-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .choices {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }
      .choices-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .choice {
        width: 100%;
      }
      .answers {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
        gap: 0.75rem;
      }
      @media (max-width: 720px) {
        .form {
          min-width: 100%;
        }
        .header-grid {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssessmentTestFormModalComponent {
  readonly dialogRef = inject(
    MatDialogRef<AssessmentTestFormModalComponent>
  );
  readonly data =
    inject<AssessmentTestFormDialogData>(MAT_DIALOG_DATA);
  private readonly formSvc = inject(AssessmentTestFormService);
  private readonly api = inject(AssessmentTestsApiService);

  readonly subjects: AssessmentSubject[] = [
    'ANGULAR',
    'NESTJS',
    'RXJS',
  ];
  readonly submitting = signal(false);

  form: AssessmentTestForm = this.formSvc.createForm(this.data.test);

  questionControls() {
    return this.form.controls.testQuestions.controls;
  }

  addQuestion() {
    this.formSvc.addQuestion(this.form);
  }

  removeQuestion(index: number) {
    this.formSvc.removeQuestion(this.form, index);
  }

  addChoice(question: FormGroup<TestQuestionForm>) {
    this.formSvc.addChoice(question);
  }

  removeChoice(question: FormGroup<TestQuestionForm>, index: number) {
    this.formSvc.removeChoice(question, index);
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload = this.formSvc.toPayload(this.form);
    this.submitting.set(true);

    if (this.data.mode === 'create') {
      this.api
        .create$(payload)
        .pipe(finalize(() => this.submitting.set(false)))
        .subscribe((created) => this.dialogRef.close(created));
      return;
    }

    if (!this.data.test) {
      this.dialogRef.close();
      return;
    }

    this.api
      .update$({ ...payload, _id: this.data.test._id })
      .pipe(finalize(() => this.submitting.set(false)))
      .subscribe((updated) => this.dialogRef.close(updated));
  }
}
