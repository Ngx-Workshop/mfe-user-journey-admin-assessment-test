import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { AssessmentTestPayload } from '../../models/assessment-test';
import { TestQuestionForm } from '../../services/assessment-test-form.service';
import { FormGroup } from '@angular/forms';
type ReviewQuestion = ReturnType<FormGroup<TestQuestionForm>['getRawValue']>;

@Component({
  selector: 'ngx-assessment-review',
  imports: [MatButtonModule, MatCardModule, MatIconModule],
  template: `
    <mat-card class="assessment-review__panel">
      <mat-card-header>
        <mat-card-title>Review</mat-card-title>
        <mat-card-subtitle>Double check before saving.</mat-card-subtitle>
      </mat-card-header>
      <mat-card-content class="assessment-review__review">
        <div>
          <p class="assessment-review__label">Name</p>
          <p class="assessment-review__value">{{ details().name }}</p>
        </div>
        <div>
          <p class="assessment-review__label">Subject</p>
          <p class="assessment-review__value">{{ details().subject }}</p>
        </div>
        <div>
          <p class="assessment-review__label">Level</p>
          <p class="assessment-review__value">{{ details().level }}</p>
        </div>
        <div>
          <div class="assessment-review__review-heading">
            <h3>{{ total() }} questions ready</h3>
            <span>Expand a question to check its answer and feedback.</span>
          </div>
          <div class="assessment-review__review-questions">
            @for (q of questions(); track reviewPage() * 10 + $index; let i = $index) {
              <details class="assessment-review__review-question">
                <summary>
                  <span class="assessment-review__review-number">{{
                    reviewPage() * 10 + i + 1
                  }}</span
                  ><span>{{ q.question }}</span
                  ><mat-icon>expand_more</mat-icon>
                </summary>
                <div class="assessment-review__review-detail">
                  <button mat-button (click)="edit.emit(reviewPage() * 10 + i)">
                    <mat-icon>edit</mat-icon>Edit question
                    {{ reviewPage() * 10 + i + 1 }}
                  </button>
                  <ul>
                    @for (c of q.choices; track $index) {
                      <li [class.assessment-review__correct]="c === q.answer">
                        {{ c }}
                        @if (c === q.answer) {
                          <strong> (correct answer)</strong>
                        }
                      </li>
                    }
                  </ul>
                  <p>
                    <strong>Correct feedback:</strong>
                    {{ q.correctResponse }}
                  </p>
                  <p>
                    <strong>Incorrect feedback:</strong>
                    {{ q.incorrectResponse }}
                  </p>
                </div>
              </details>
            }
          </div>
          @if (total() > 10) {
            <div class="assessment-review__review-pagination">
              <button
                mat-button
                [disabled]="reviewPage() === 0"
                (click)="pageChange.emit(reviewPage() - 1)"
              >
                Previous 10</button
              ><span>Page {{ reviewPage() + 1 }} of {{ pageCount() }}</span
              ><button
                mat-button
                [disabled]="reviewPage() + 1 >= pageCount()"
                (click)="pageChange.emit(reviewPage() + 1)"
              >
                Next 10
              </button>
            </div>
          }
        </div>
        <p class="assessment-review__hint">
          Once learners have started this assessment, its questions cannot be changed or deleted.
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
      .assessment-review__hint {
        color: var(--mat-sys-on-surface-variant);
        font-size: 0.9rem;
        margin: 0;
        line-height: 1.6;
      }
      .assessment-review__panel {
        padding: 1rem;
        border: 1px solid var(--mat-sys-outline-variant);
        border-radius: 16px;
        box-shadow: none;
      }
      .assessment-review__review {
        display: grid;
        gap: 1rem;
        padding-top: 1rem;
      }
      .assessment-review__label {
        color: var(--mat-sys-on-surface-variant);
        font-size: 0.75rem;
        margin: 0;
      }
      .assessment-review__value {
        margin: 0.3rem 0;
      }
      .assessment-review__review-heading {
        display: flex;
        flex-wrap: wrap;
        align-items: baseline;
        justify-content: space-between;
        gap: 0.5rem;
        margin: 1rem 0;
      }
      .assessment-review__review-heading h3 {
        margin: 0;
      }
      .assessment-review__review-heading span {
        font-size: 0.8rem;
        color: var(--mat-sys-on-surface-variant);
      }
      .assessment-review__review-questions {
        display: grid;
        gap: 0.5rem;
      }
      .assessment-review__review-question {
        border: 1px solid var(--mat-sys-outline-variant);
        border-radius: 10px;
        overflow: hidden;
      }
      summary {
        list-style: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 1rem;
      }
      summary::-webkit-details-marker {
        display: none;
      }
      summary > span:nth-child(2) {
        flex: 1;
        min-width: 0;
        overflow-wrap: anywhere;
      }
      summary mat-icon {
        flex-shrink: 0;
      }
      details[open] summary mat-icon {
        transform: rotate(180deg);
      }
      summary:focus-visible {
        outline: 2px solid var(--mat-sys-primary);
        outline-offset: -3px;
      }
      .assessment-review__review-number {
        font-size: 0.8rem;
        color: var(--mat-sys-primary);
      }
      .assessment-review__review-detail {
        padding: 0 1rem 1rem;
        white-space: pre-wrap;
        overflow-wrap: anywhere;
      }
      .assessment-review__correct {
        color: var(--mat-sys-primary);
      }
      .assessment-review__review-pagination {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.5rem;
        font-size: 0.8rem;
        margin-top: 1rem;
      }
      @media (max-width: 850px) {
        .assessment-review__panel {
          padding: 0.25rem;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssessmentReviewComponent {
  readonly details = input.required<Pick<AssessmentTestPayload, 'name' | 'subject' | 'level'>>();
  readonly total = input.required<number>();
  readonly questions = input.required<ReviewQuestion[]>();
  readonly reviewPage = input.required<number>();
  readonly pageCount = input.required<number>();
  readonly pageChange = output<number>();
  readonly edit = output<number>();
}
