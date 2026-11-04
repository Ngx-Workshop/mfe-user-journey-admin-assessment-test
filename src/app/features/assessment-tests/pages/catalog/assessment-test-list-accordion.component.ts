import { NgxButton } from '@tmdjr/ngx-workshop-design-system';
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
  imports: [NgxButton,DatePipe, MatButtonModule, MatIconModule, MatMenuModule],
  template: `
    <ul class="assessment-list" aria-label="Assessment tests">
      @for (test of tests(); track test._id) {
        <li class="assessment-list__assessment-row">
          <div class="assessment-list__row-top">
            <div class="assessment-list__identity">
              <div class="assessment-list__metadata">
                <span class="assessment-list__subject">{{
                  test.sectionTitle || test.subject
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
                mat-stroked-button ngxButton surface="outline"
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
              <mat-menu #menu="matMenu" class="ngx-design-system-overlay"
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
      :host { display: block; }
      .assessment-list {
        list-style: none;
        padding: 0;
        margin: 0;
        display: grid;
        gap: 0;
      }
      .assessment-list__assessment-row {
        border: 1px solid var(--ngx-color-border);
        border-radius: 0;
        background: var(--ngx-color-surface);
        overflow: hidden;
      }
      .assessment-list__row-top {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 10px;
      }
      .assessment-list__identity { flex: 1; min-width: 0; }
      .assessment-list__metadata,
      .assessment-list__details-line,
      .assessment-list__actions {
        display: flex;
        align-items: center;
        gap: 16px;
        flex-wrap: wrap;
      }
      .assessment-list__metadata { font-size: 12px; font-weight: 600; }
      .assessment-list__subject { color: var(--ngx-color-primary); letter-spacing: 0.06em; }
      h3 { margin: 4px 0; }
      .assessment-list__title-link {
        font: inherit;
        font-size: 14px;
        font-weight: 600;
        color: var(--ngx-color-text);
        border: 0;
        padding: 0;
        background: transparent;
        text-align: left;
        cursor: pointer;
        overflow-wrap: anywhere;
      }
      .assessment-list__title-link:hover { color: var(--ngx-color-primary); text-decoration: underline; }
      .assessment-list__title-link:focus-visible,
      summary:focus-visible { outline: 2px solid var(--ngx-color-primary); outline-offset: 4px; }
      .assessment-list__details-line { font-size: 13px; color: var(--ngx-color-muted); gap: 8px 20px; }
      .assessment-list__actions { flex-wrap: nowrap; gap: 4px; }
      .assessment-list__preview { border-top: 1px solid var(--ngx-color-border); padding: 6px 10px; }
      summary { cursor: pointer; font-size: 13px; font-weight: 500; }
      summary span { color: var(--ngx-color-muted); margin-left: 12px; font-weight: 400; }
      ol {
        padding-left: 22px;
        display: grid;
        gap: 0;
        overflow-wrap: anywhere;
      }
      .assessment-list__preview p { font-size: 13px; color: var(--ngx-color-muted); }
      @media (max-width: 600px) {
      .assessment-list__row-top { padding: 8px; flex-wrap: wrap; gap: 0; }
      .assessment-list__identity { flex-basis: auto; }
      .assessment-list__actions { margin-left: auto; }
      .assessment-list__preview { padding: 6px 8px; }
      .assessment-list__title-link { font-size: 14px; }
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
