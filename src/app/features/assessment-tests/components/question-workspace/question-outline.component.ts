import { NgxButton } from '@tmdjr/ngx-workshop-design-system';
import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Question } from './question-workspace.view-model';
import { QuestionWorkspaceViewModel } from './question-workspace.view-model';

@Component({
  selector: 'ngx-question-outline',
  imports: [NgxButton,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
  ],
  template: `
    <aside
      class="question-outline__outline"
      aria-label="Question outline"
    >
      <div class="question-outline__outline-header">
        <h3>Questions</h3>
        <span>{{ vm().matches().length }} matches</span>
      </div>
      <mat-form-field appearance="outline" subscriptSizing="dynamic"
        ><mat-label>Find a question</mat-label
        ><input
          matInput
          [value]="vm().search()"
          (input)="searchChange.emit($any($event.target).value)"
          placeholder="Search prompt or number"
        />
        @if (vm().search()) {
          <button
            mat-icon-button
            matSuffix
            aria-label="Clear question search"
            (click)="searchChange.emit('')"
          >
            <mat-icon>close</mat-icon>
          </button>
        }
      </mat-form-field>
      <div
        class="question-outline__filter-tabs"
        role="group"
        aria-label="Filter questions"
      >
        <button
          [attr.aria-pressed]="!vm().incompleteOnly()"
          (click)="incompleteChange.emit(false)"
        >
          All {{ vm().questions().length }}
        </button>
        <button
          [attr.aria-pressed]="vm().incompleteOnly()"
          (click)="incompleteChange.emit(true)"
        >
          Incomplete
          {{ vm().questions().length - vm().completeCount() }}
        </button>
      </div>
      <nav
        class="question-outline__question-list"
        aria-label="Select a question"
      >
        @for (item of vm().visible(); track item.question) {
          <button
            class="question-outline__question-link"
            [title]="
              item.question.controls.question.value ||
              'Untitled question'
            "
            [class.question-outline__question-link--selected]="
              vm().selected() === item.question
            "
            [attr.aria-current]="
              vm().selected() === item.question ? 'true' : null
            "
            [attr.aria-label]="
              'Question ' +
              (item.index + 1) +
              ': ' +
              (item.question.controls.question.value ||
                'Untitled question') +
              (item.question.valid ? ', ready' : ', incomplete')
            "
            (click)="questionSelect.emit(item.question)"
          >
            <span class="question-outline__number">{{
              item.index + 1
            }}</span
            ><span class="question-outline__question-label"
              >{{
                item.question.controls.question.value ||
                  'Untitled question'
              }}<small>{{
                item.question.valid ? 'Ready' : 'Incomplete'
              }}</small></span
            ><mat-icon
              class="question-outline__status"
              [class.question-outline__status--ready]="
                item.question.valid
              "
              >{{
                item.question.valid ? 'check_circle' : 'edit_note'
              }}</mat-icon
            >
          </button>
        } @empty {
          <div class="question-outline__no-matches">
            <p>No questions match.</p>
            <button mat-button ngxButton surface="glass" (click)="clear.emit()">
              Clear filters
            </button>
          </div>
        }
      </nav>
      @if (vm().pageCount() > 1) {
        <div class="question-outline__outline-pagination">
          <button
            mat-icon-button
            aria-label="Previous question page"
            [disabled]="vm().currentPage() === 0"
            (click)="pageChange.emit(vm().currentPage() - 1)"
          >
            <mat-icon>chevron_left</mat-icon></button
          ><span
            >{{ vm().currentPage() + 1 }} /
            {{ vm().pageCount() }}</span
          ><button
            mat-icon-button
            aria-label="Next question page"
            [disabled]="vm().currentPage() + 1 === vm().pageCount()"
            (click)="pageChange.emit(vm().currentPage() + 1)"
          >
            <mat-icon>chevron_right</mat-icon>
          </button>
        </div>
      }
    </aside>
  `,
  styles: [`
    :host { display: block; min-width: 0; }
    h3, p { margin: 0; }
    h3 { font-size: 0.85rem; }
    .question-outline__outline-header, .question-outline__outline-pagination { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
    .question-outline__outline-header { margin-bottom: 12px; }
    .question-outline__outline-header span { font-size: 0.7rem; color: var(--ngx-color-muted); }
    mat-form-field { width: 100%; min-width: 0; }
    .question-outline__filter-tabs { display: flex; gap: 4px; margin: 8px 0; }
    .question-outline__filter-tabs button { flex: 1; min-height: 40px; border: 1px solid var(--ngx-color-border); background: transparent; color: var(--ngx-color-muted); font: inherit; font-size: 0.7rem; cursor: pointer; }
    .question-outline__filter-tabs button[aria-pressed='true'] { background: var(--ngx-color-surface-high); color: var(--ngx-color-primary); }
    .question-outline__question-list { display: grid; grid-template-columns: minmax(0, 1fr); gap: 2px; padding: 2px; }
    .question-outline__question-link { min-width: 0; display: flex; align-items: center; gap: 8px; padding: 8px 6px; text-align: left; border: 1px solid transparent; background: transparent; color: var(--ngx-color-text); cursor: pointer; font: inherit; width: 100%; }
    .question-outline__question-link:hover, .question-outline__question-link--selected { background: var(--ngx-color-surface-high); }
    .question-outline__question-link--selected { border-color: var(--ngx-color-primary); }
    .question-outline__number { flex-shrink: 0; width: 24px; font-size: 0.75rem; color: var(--ngx-color-primary); }
    .question-outline__question-label { min-width: 0; flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-size: 0.75rem; }
    small { display: block; font-size: 0.65rem; color: var(--ngx-color-muted); margin-top: 3px; }
    .question-outline__question-link mat-icon { flex-shrink: 0; font-size: 18px; width: 18px; height: 18px; color: var(--ngx-color-muted); }
    .question-outline__question-link .question-outline__status--ready { color: var(--ngx-color-success); }
    .question-outline__outline-pagination { justify-content: center; font-size: 0.75rem; }
    button:focus-visible { outline: 2px solid var(--ngx-color-primary); outline-offset: -2px; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuestionOutlineComponent {
  readonly vm = input.required<QuestionWorkspaceViewModel>();
  readonly searchChange = output<string>();
  readonly incompleteChange = output<boolean>();
  readonly questionSelect = output<Question>();
  readonly clear = output<void>();
  readonly pageChange = output<number>();
}
