import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  input,
  output,
  viewChild,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import {
  AssessmentTestForm,
  AssessmentTestFormService,
} from '../../services/assessment-test-form.service';
import { Question, QuestionWorkspaceViewModel } from './question-workspace.view-model';
import { QuestionActionsComponent } from './question-actions.component';
import { QuestionOutlineComponent } from './question-outline.component';
import { QuestionFieldsComponent } from './question-fields.component';

@Component({
  selector: 'ngx-question-workspace',
  imports: [
    QuestionActionsComponent,
    QuestionOutlineComponent,
    QuestionFieldsComponent,
    MatButtonModule,
    MatIconModule,
  ],
  template: `
    <section class="question-workspace__workspace-summary" aria-label="Question readiness">
      <div>
        <p class="question-workspace__eyebrow">Build your assessment</p>
        <h2>
          Questions <span class="question-workspace__count">{{ vm.questions().length }}</span>
        </h2>
        <p>{{ vm.completeCount() }} of {{ vm.questions().length }} ready for review</p>
      </div>
      <div class="question-workspace__summary-actions">
        @if (vm.completeCount() < vm.questions().length) {
          <button mat-stroked-button (click)="vm.firstIncomplete()">
            <mat-icon>rule</mat-icon>Find incomplete
          </button>
        }
        <button mat-flat-button (click)="vm.add()"><mat-icon>add</mat-icon>Add question</button>
      </div>
    </section>
    <div
      class="question-workspace__completion-track"
      role="progressbar"
      aria-label="Questions ready for review"
      [attr.aria-valuenow]="vm.completeCount()"
      aria-valuemin="0"
      [attr.aria-valuemax]="vm.questions().length"
    >
      <span [style.width.%]="(100 * vm.completeCount()) / vm.questions().length"></span>
    </div>
    <div class="question-workspace__workspace">
      <ngx-question-outline
        [vm]="vm"
        (searchChange)="vm.find($event)"
        (incompleteChange)="vm.filterIncomplete($event)"
        (select)="vm.select($event)"
        (clear)="vm.clearFilters()"
        (pageChange)="vm.page.set($event)"
      />
      <section class="question-workspace__question-editor" aria-label="Selected question editor">
        <div class="question-workspace__status-message" role="status">
          {{ vm.announcement() }}
          @if (vm.removed()) {
            <button mat-button (click)="vm.undo()">Undo removal</button>
          }
        </div>
        @if (vm.selected(); as q) {
          <div class="question-workspace__editor-header">
            <div>
              <p class="question-workspace__eyebrow">
                {{ q.valid ? 'Ready for review' : 'Work in progress' }}
              </p>
              <h2 #editorHeading tabindex="-1">
                Question {{ vm.selectedIndex() + 1 }}
                <span class="question-workspace__muted">of {{ vm.questions().length }}</span>
              </h2>
            </div>
            <ngx-question-actions
              [selectedIndex]="vm.selectedIndex()"
              [count]="vm.questions().length"
              [moveOpen]="vm.moveOpen()"
              [moveTarget]="vm.moveTarget()"
              [validMove]="vm.validMove()"
              (move)="vm.move($event)"
              (openMove)="vm.openMove()"
              (duplicate)="vm.duplicate()"
              (remove)="vm.remove()"
              (moveTo)="vm.moveTo()"
              (targetChange)="vm.moveTarget.set($event)"
              (cancelMove)="vm.moveOpen.set(false)"
            />
          </div>
          <ngx-question-fields
            [question]="q"
            (addChoice)="addChoice(q)"
            (removeChoice)="removeChoice(q, $event)"
          />
          <div class="question-workspace__question-pagination">
            <button
              mat-stroked-button
              [disabled]="vm.selectedIndex() === 0"
              (click)="vm.adjacent(-1)"
            >
              <mat-icon>chevron_left</mat-icon>Previous question</button
            ><button
              mat-stroked-button
              [disabled]="vm.selectedIndex() === vm.questions().length - 1"
              (click)="vm.adjacent(1)"
            >
              Next question<mat-icon>chevron_right</mat-icon>
            </button>
          </div>
        }
      </section>
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
      h2,
      p {
        margin: 0;
      }
      h2 {
        font-size: 1.35rem;
      }
      .question-workspace__eyebrow {
        font-size: 0.7rem;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        color: var(--mat-sys-primary);
        margin-bottom: 0.4rem;
        font-weight: 600;
      }
      .question-workspace__workspace-summary,
      .question-workspace__summary-actions,
      .question-workspace__editor-header,
      .question-workspace__question-pagination {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.75rem;
      }
      .question-workspace__workspace-summary p:not(.question-workspace__eyebrow) {
        color: var(--muted);
        font-size: 0.85rem;
        margin-top: 0.4rem;
      }
      .question-workspace__count {
        font-size: 0.85rem;
        color: var(--muted);
      }
      .question-workspace__completion-track {
        height: 4px;
        background: var(--mat-sys-surface-container-highest);
        border-radius: 4px;
        overflow: hidden;
        margin: 1.1rem 0 1.5rem;
      }
      .question-workspace__completion-track span {
        display: block;
        height: 100%;
        background: var(--mat-sys-primary);
      }
      .question-workspace__workspace {
        display: grid;
        grid-template-columns: minmax(230px, 30%) minmax(0, 1fr);
        gap: 1.25rem;
        align-items: start;
      }
      .question-workspace__question-editor {
        min-width: 0;
        border: 1px solid var(--line);
        border-radius: 16px;
        background: var(--mat-sys-surface-container-low);
        padding: 1.5rem;
      }
      .question-workspace__editor-header {
        flex-wrap: wrap;
        border-bottom: 1px solid var(--line);
        padding-bottom: 1rem;
        margin-bottom: 1.5rem;
      }
      .question-workspace__muted {
        font-size: 0.85rem;
        font-weight: 400;
        color: var(--muted);
      }
      .question-workspace__status-message:empty {
        display: none;
      }
      .question-workspace__status-message {
        font-size: 0.85rem;
        color: var(--mat-sys-primary);
        margin-bottom: 1rem;
      }
      .question-workspace__question-pagination {
        flex-wrap: wrap;
        border-top: 1px solid var(--line);
        padding-top: 1rem;
      }
      button:focus-visible,
      h2:focus-visible {
        outline: 2px solid var(--mat-sys-primary);
        outline-offset: 2px;
      }
      @media (max-width: 850px) {
        .question-workspace__workspace {
          grid-template-columns: 1fr;
        }
        .question-workspace__workspace-summary {
          align-items: start;
          flex-direction: column;
        }
        .question-workspace__summary-actions {
          flex-wrap: wrap;
        }
        .question-workspace__question-editor {
          padding: 1rem;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuestionWorkspaceComponent {
  readonly form = input.required<AssessmentTestForm>();
  readonly requestedQuestion = input<Question | null>(null);
  readonly selectionChange = output<Question>();
  private readonly forms = inject(AssessmentTestFormService);
  private readonly heading = viewChild<ElementRef<HTMLElement>>('editorHeading');
  readonly vm = new QuestionWorkspaceViewModel(
    this.forms,
    this.form,
    this.requestedQuestion,
    (question) => this.selectionChange.emit(question),
    () => this.heading()?.nativeElement.focus({ preventScroll: false })
  );

  showInvalid(question: Question) {
    this.vm.showInvalid(question);
  }
  addChoice(question: Question) {
    this.forms.addChoice(question);
  }
  removeChoice(question: Question, index: number) {
    this.forms.removeChoice(question, index);
  }
}
