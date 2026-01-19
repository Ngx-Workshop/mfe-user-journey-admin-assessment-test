
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
    MatButtonModule,
    MatChipsModule,
    MatExpansionModule,
    MatIconModule
],
  template: `
    <div class="results">
      <div class="results-header">
        <button
          mat-icon-button
          matTooltip="Refresh list"
          aria-label="Refresh"
        >
          <mat-icon>refresh</mat-icon>
        </button>
        <h4>
          Results {{ filteredCount() }} of {{ totalCount() }}
          @if (subjectFilter() !== 'ALL') { · Subject:
          {{ subjectFilter() }} } @if (levelCap() !== null) { · Level
          ≤
          {{ levelCap() }}
          }
        </h4>
      </div>

      <mat-accordion class="list" hideToggle>
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

          @if (t.testQuestions.length) { @for (q of t.testQuestions;
          track q.question) {
          <div class="details">
            <b>{{ q.question }}</b>
            <ol class="upper-alpha">
              @for (choices of q.choices; track $index) {
              <li>
                <span class="a">{{ choices.value }}</span>
              </li>
              }
            </ol>

            <span class="answer"
              >Answer: <i>{{ q.answer }}</i></span
            >
          </div>
          } }
        </mat-expansion-panel>
        }
      </mat-accordion>
    </div>
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
              var(--mat-sys-surface-container-high),
          )
        );
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
      .results {
        background: var(--mat-sys-surface-container-low);
        padding: 1.5rem;
        border-radius: var(
          --mat-card-elevated-container-shape,
          var(--mat-sys-corner-medium)
        );
      }
      .results-header {
        display: flex;
        gap: 0.5rem;
        align-items: center;
        margin-bottom: 1rem;
      }
      .details {
        background: var(--mat-sys-surface-container-highest);
        padding: 1.5rem;
        margin-bottom: 1rem;
        border-radius: var(
          --mat-card-elevated-container-shape,
          var(--mat-sys-corner-medium)
        );
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssessmentTestListAccordionComponent {
  readonly tests = input<AssessmentTestDto[]>([]);
  readonly filteredCount = input.required<number>();
  readonly totalCount = input.required<number>();
  readonly subjectFilter = input<
    AssessmentTestDto['subject'] | 'ALL'
  >('ALL');
  readonly levelCap = input<number | null>(null);

  readonly edit = output<AssessmentTestDto>();
  readonly delete = output<AssessmentTestDto>();
}
