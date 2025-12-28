import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { AssessmentTestDto } from '@tmdjr/service-nestjs-assessment-test-contracts';

@Component({
  selector: 'ngx-assessment-test-list-accordion',
  imports: [
    CommonModule,
    MatButtonModule,
    MatChipsModule,
    MatExpansionModule,
    MatIconModule,
  ],
  template: `
    <mat-accordion class="list" multi>
      @for (t of tests(); track t._id) {
      <mat-expansion-panel>
        <mat-expansion-panel-header>
          <mat-panel-title>{{ t.name }}</mat-panel-title>
          <mat-panel-description>
            <mat-chip-set>
              <mat-chip appearance="outlined"
                >Level {{ t.level }}</mat-chip
              >
              <mat-chip appearance="outlined" color="primary">{{
                t.subject
              }}</mat-chip>
            </mat-chip-set>
          </mat-panel-description>

          <div class="row">
            <div class="row-actions">
              <button mat-icon-button (click)="edit.emit(t)">
                <mat-icon>edit</mat-icon>
              </button>
              <button mat-icon-button (click)="delete.emit(t)">
                <mat-icon>delete</mat-icon>
              </button>
            </div>
          </div>
        </mat-expansion-panel-header>

        <div class="details">
          @if (t.testQuestions.length) {
          <ol class="questions-list">
            @for (q of t.testQuestions; track q.question) {
            <li>
              <b>{{ q.question }}</b>
              <ol class="upper-alpha">
                @for (choices of q.choices; track $index) {
                <li>
                  <span class="a">{{ choices.value }}</span>
                </li>
                }
              </ol>
            </li>
            <span class="answer"
              >Answer: <i>{{ q.answer }}</i></span
            >
            }
          </ol>
          }
        </div>
      </mat-expansion-panel>
      }
    </mat-accordion>
  `,
  styles: [
    `
      @use '@angular/material' as mat;
      .list {
        width: 100%;
        @include mat.expansion-overrides(
          (
            container-text-color: var(--mat-sys-on-surface),
            container-background-color:
              var(--mat-sys-surface-container-low),
          )
        );
      }
      button[mat-icon-button] {
        margin-right: 1rem;
      }
      .upper-alpha {
        list-style: lower-alpha;
      }
      .questions-list {
        margin: 0.25rem 0 0;
        padding-left: 1rem;
        display: grid;
        gap: 0.25rem;
      }
      .answer {
        margin-bottom: 1rem;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssessmentTestListAccordionComponent {
  readonly tests = input<AssessmentTestDto[]>([]);

  readonly edit = output<AssessmentTestDto>();
  readonly delete = output<AssessmentTestDto>();
}
