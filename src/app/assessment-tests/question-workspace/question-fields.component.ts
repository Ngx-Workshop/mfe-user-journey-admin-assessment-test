import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Question } from './question-workspace.view-model';

@Component({
  selector: 'ngx-question-fields',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
  ],
  template: `
    <div class="question-fields" [formGroup]="question()">
      <mat-form-field appearance="outline" class="question-fields__full">
        <mat-label>Prompt</mat-label>
        <textarea matInput formControlName="question" rows="3" required></textarea>
        @if (question().controls.question.hasError('maxlength')) {
          <mat-error>Use at most 1000 characters.</mat-error>
        }
        @if (question().controls.question.hasError('required')) {
          <mat-error>Required</mat-error>
        }
      </mat-form-field>

      <div formArrayName="choices" class="question-fields__choices">
        <div class="question-fields__choices-head">
          <h4>Choices</h4>
          <button mat-button (click)="addChoice.emit()">
            <mat-icon>add</mat-icon>
            Add choice
          </button>
        </div>
        @for (c of question().controls.choices.controls; track $index; let ci = $index) {
          <mat-form-field appearance="outline" class="question-fields__choice">
            <mat-label>Choice {{ ci + 1 }}</mat-label>
            <input matInput [formControlName]="ci" />
            <mat-error>Enter a choice (up to 400 characters).</mat-error>
            @if (question().controls.choices.length > 2) {
              <button
                mat-icon-button
                matSuffix
                [attr.aria-label]="'Remove choice ' + (ci + 1)"
                (click)="removeChoice.emit(ci)"
              >
                <mat-icon>close</mat-icon>
              </button>
            }
          </mat-form-field>
        }
      </div>

      @if (question().touched && question().hasError('duplicateChoices')) {
        <p class="question-fields__error" role="alert">Each choice must have a different value.</p>
      }
      @if (question().touched && question().hasError('answerChoice')) {
        <p class="question-fields__error" role="alert">
          Select a correct answer from the current choices. A choice may have changed.
        </p>
      }
      <div class="question-fields__answers">
        <mat-form-field appearance="outline" class="question-fields__full">
          <mat-label>Correct Answer</mat-label>
          <mat-select formControlName="answer" required>
            @for (opt of question().controls.choices.controls; track $index; let oi = $index) {
              <mat-option [value]="opt.value"> Choice {{ oi + 1 }} — {{ opt.value }} </mat-option>
            }
          </mat-select>
          @if (question().controls.answer.hasError('required')) {
            <mat-error>Pick an answer</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline" class="question-fields__full">
          <mat-label>Correct Response</mat-label>
          <textarea matInput formControlName="correctResponse" rows="2" required></textarea>
          <mat-error>Enter feedback (up to 1000 characters).</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="question-fields__full">
          <mat-label>Incorrect Response</mat-label>
          <textarea matInput formControlName="incorrectResponse" rows="2" required></textarea>
          <mat-error>Enter feedback (up to 1000 characters).</mat-error>
        </mat-form-field>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        --line: var(--mat-sys-outline-variant);
        --muted: var(--mat-sys-on-surface-variant);
        display: block;
        min-width: 0;
      }
      p {
        margin: 0;
      }
      .question-fields__choices-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.75rem;
      }
      mat-form-field {
        width: 100%;
        min-width: 0;
      }
      .question-fields {
        display: grid;
        gap: 0.5rem;
      }
      .question-fields__choices-head {
        margin: 0.25rem 0 0.75rem;
      }
      .question-fields__choices-head h4 {
        margin: 0;
      }
      .question-fields__answers {
        display: grid;
        gap: 0.5rem;
        border-top: 1px solid var(--line);
        padding-top: 1rem;
      }
      .question-fields__error {
        color: var(--mat-sys-error);
        font-size: 0.85rem;
        margin: 0 0 0.5rem;
      }
      button:focus-visible {
        outline: 2px solid var(--mat-sys-primary);
        outline-offset: 2px;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuestionFieldsComponent {
  readonly question = input.required<Question>();
  readonly addChoice = output<void>();
  readonly removeChoice = output<number>();
}
