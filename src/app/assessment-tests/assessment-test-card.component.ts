import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AssessmentTestDto } from '@tmdjr/service-nestjs-assessment-test-contracts';

@Component({
  selector: 'ngx-assessment-test-card',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatChipsModule,
    MatMenuModule,
  ],
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title class="title">
          <span class="name" [matTooltip]="test().name">{{
            test().name
          }}</span>

          <button
            mat-icon-button
            [matMenuTriggerFor]="menu"
            aria-label="More actions"
          >
            <mat-icon>more_vert</mat-icon>
          </button>
        </mat-card-title>
        <mat-card-subtitle>
          <mat-chip-set>
            <mat-chip appearance="outlined" color="primary">
              {{ test().subject }}
            </mat-chip>
            <mat-chip appearance="outlined">
              Level {{ test().level }}
            </mat-chip>
            <mat-chip appearance="outlined" color="accent">
              {{ questionCount() }} questions
            </mat-chip>
          </mat-chip-set>
        </mat-card-subtitle>
      </mat-card-header>

      <mat-card-content>
        <p class="meta">
          Updated {{ test().lastUpdated | date : 'medium' }}
        </p>

        <div class="questions">
          <p class="label">Sample question</p>
          <p
            class="question"
            [matTooltip]="test().testQuestions[0]?.question"
          >
            {{
              test().testQuestions[0]?.question ||
                'No questions defined yet.'
            }}
          </p>
        </div>
      </mat-card-content>
    </mat-card>

    <mat-menu #menu="matMenu">
      <button mat-menu-item (click)="edit.emit(test())">
        <mat-icon>edit</mat-icon>
        <span>Edit</span>
      </button>
      <button mat-menu-item (click)="remove.emit(test())">
        <mat-icon>delete</mat-icon>
        <span>Delete</span>
      </button>
    </mat-menu>
  `,
  styles: [
    `
      .title {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.5rem;
      }
      .name {
        display: inline-block;
        max-width: 80%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .meta {
        margin: 0.25rem 0 0.75rem;
        opacity: 0.8;
        font-size: 0.875rem;
      }
      .questions {
        padding: 0.75rem;
        border: 1px solid rgba(0, 0, 0, 0.08);
        border-radius: 8px;
        background: rgba(0, 0, 0, 0.01);
      }
      .label {
        margin: 0;
        font-weight: 600;
        font-size: 0.875rem;
        opacity: 0.75;
      }
      .question {
        margin: 0.25rem 0 0;
        line-height: 1.35;
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssessmentTestCardComponent {
  readonly test = input.required<AssessmentTestDto>();
  readonly edit = output<AssessmentTestDto>();
  readonly remove = output<AssessmentTestDto>();

  readonly questionCount = computed(
    () => this.test().testQuestions.length || 0
  );
}
