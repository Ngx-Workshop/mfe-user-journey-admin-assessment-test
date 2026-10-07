import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { AssessmentTestDto } from '@tmdjr/service-nestjs-assessment-test-contracts';

@Component({
  selector: 'ngx-assessment-test-list-accordion',
  imports: [DatePipe, MatButtonModule, MatIconModule, MatMenuModule],
  template: `
    <ul class="assessment-list" aria-label="Assessment tests">
      @for (test of tests(); track test._id) {
        <li class="assessment-list__assessment-row">
          <div class="assessment-list__row-top">
            <div class="assessment-list__identity">
              <div class="assessment-list__metadata">
                <span class="assessment-list__subject">{{
                  test.subject
                }}</span
                ><span>Level {{ test.level }}</span>
              </div>
              <h3>
                <button
                  class="assessment-list__title-link"
                  (click)="edit.emit(test)"
                  [disabled]="busy()"
                >
                  {{ test.name }}
                </button>
              </h3>
              <div class="assessment-list__details-line">
                <span
                  >{{ test.testQuestions.length }}
                  {{
                    test.testQuestions.length === 1
                      ? 'question'
                      : 'questions'
                  }}</span
                ><span
                  >Updated
                  {{
                    test.lastUpdated
                      ? (test.lastUpdated | date: 'mediumDate')
                      : 'date unavailable'
                  }}</span
                >
              </div>
            </div>
            <div class="assessment-list__actions">
              <button
                mat-stroked-button
                (click)="edit.emit(test)"
                [disabled]="busy()"
                [attr.aria-label]="'Edit ' + test.name"
              >
                <mat-icon>edit</mat-icon>Edit
              </button>
              <button
                mat-icon-button
                [matMenuTriggerFor]="menu"
                [disabled]="busy()"
                [attr.aria-label]="'More actions for ' + test.name"
              >
                <mat-icon>more_vert</mat-icon>
              </button>
              <mat-menu #menu="matMenu"
                ><button mat-menu-item (click)="delete.emit(test)">
                  <mat-icon>delete_outline</mat-icon
                  ><span>Delete assessment</span>
                </button></mat-menu
              >
            </div>
          </div>
          @if (test.testQuestions.length) {
            <details class="assessment-list__preview">
              <summary>
                Preview questions
                <span>{{
                  test.testQuestions.length > 3
                    ? 'First 3 of ' + test.testQuestions.length
                    : test.testQuestions.length + ' total'
                }}</span>
              </summary>
              <ol>
                @for (
                  question of test.testQuestions.slice(0, 3);
                  track $index
                ) {
                  <li>{{ question.question }}</li>
                }
              </ol>
              <p>
                Open the editor to review all questions, answers and
                feedback.
              </p>
            </details>
          }
        </li>
      }
    </ul>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .assessment-list {
        list-style: none;
        padding: 0;
        margin: 0;
        display: grid;
        gap: 12px;
      }
      .assessment-list__assessment-row {
        border: 1px solid var(--mat-sys-outline-variant);
        border-radius: 16px;
        background: var(--mat-sys-surface-container-low);
        overflow: hidden;
      }
      .assessment-list__row-top {
        display: flex;
        align-items: center;
        gap: 20px;
        padding: 22px 24px;
      }
      .assessment-list__identity {
        flex: 1;
        min-width: 0;
      }
      .assessment-list__metadata,
      .assessment-list__details-line,
      .assessment-list__actions {
        display: flex;
        align-items: center;
        gap: 16px;
        flex-wrap: wrap;
      }
      .assessment-list__metadata {
        font-size: 12px;
        font-weight: 600;
      }
      .assessment-list__subject {
        color: var(--mat-sys-primary);
        letter-spacing: 0.06em;
      }
      h3 {
        margin: 8px 0;
      }
      .assessment-list__title-link {
        font: inherit;
        font-size: 20px;
        font-weight: 600;
        color: var(--mat-sys-on-surface);
        border: 0;
        padding: 0;
        background: transparent;
        text-align: left;
        cursor: pointer;
        overflow-wrap: anywhere;
      }
      .assessment-list__title-link:hover {
        color: var(--mat-sys-primary);
        text-decoration: underline;
      }
      .assessment-list__title-link:focus-visible,
      summary:focus-visible {
        outline: 2px solid var(--mat-sys-primary);
        outline-offset: 4px;
      }
      .assessment-list__details-line {
        font-size: 13px;
        color: var(--mat-sys-on-surface-variant);
        gap: 8px 20px;
      }
      .assessment-list__actions {
        flex-wrap: nowrap;
        gap: 4px;
      }
      .assessment-list__preview {
        border-top: 1px solid var(--mat-sys-outline-variant);
        padding: 12px 24px;
      }
      summary {
        cursor: pointer;
        font-size: 13px;
        font-weight: 500;
      }
      summary span {
        color: var(--mat-sys-on-surface-variant);
        margin-left: 12px;
        font-weight: 400;
      }
      ol {
        padding-left: 22px;
        display: grid;
        gap: 12px;
        overflow-wrap: anywhere;
      }
      .assessment-list__preview p {
        font-size: 13px;
        color: var(--mat-sys-on-surface-variant);
      }
      @media (max-width: 600px) {
        .assessment-list__row-top {
          padding: 16px;
          flex-wrap: wrap;
          gap: 12px;
        }
        .assessment-list__identity {
          flex-basis: 100%;
        }
        .assessment-list__actions {
          margin-left: auto;
        }
        .assessment-list__preview {
          padding: 12px 16px;
        }
        .assessment-list__title-link {
          font-size: 18px;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssessmentTestListAccordionComponent {
  readonly busy = input(false);
  readonly tests = input<AssessmentTestDto[]>([]);
  readonly edit = output<AssessmentTestDto>();
  readonly delete = output<AssessmentTestDto>();
}
