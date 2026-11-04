import { signal } from '@angular/core';
import { AssessmentPanelComponent } from '../assessment-panel.component';
import { NgxButton } from '@tmdjr/ngx-workshop-design-system';
import {
  afterNextRender,
  Injector,
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
} from '../../forms/assessment-test-form.service';
import {
  Question,
  QuestionWorkspaceViewModel,
} from './question-workspace.view-model';
import { QuestionActionsComponent } from './question-actions.component';
import { QuestionOutlineComponent } from './question-outline.component';
import { QuestionFieldsComponent } from './question-fields.component';

@Component({
  selector: 'ngx-question-workspace',
  imports: [NgxButton, AssessmentPanelComponent,
    QuestionActionsComponent,
    QuestionOutlineComponent,
    QuestionFieldsComponent,
    MatButtonModule,
    MatIconModule,
  ],
  template: `
    <section
      class="question-workspace__workspace-summary"
      aria-label="Question readiness"
    >
      <div>
        <p class="question-workspace__eyebrow">
          Build your assessment
        </p>
        <h2>
          Questions
          <span class="question-workspace__count">{{
            vm.questions().length
          }}</span>
        </h2>
        <p>
          {{ vm.completeCount() }} of
          {{ vm.questions().length }} ready for review
        </p>
      </div>
      <div class="question-workspace__summary-actions">
        @if (vm.completeCount() < vm.questions().length) {
          <button mat-stroked-button ngxButton surface="outline" (click)="vm.firstIncomplete()">
            <mat-icon>rule</mat-icon>Find incomplete
          </button>
        }
        <button mat-flat-button ngxButton surface="outline" (click)="vm.add()">
          <mat-icon>add</mat-icon>Add question
        </button>
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
      <span
        [style.width.%]="
          (100 * vm.completeCount()) / vm.questions().length
        "
      ></span>
    </div>
    <div class="question-workspace__switch" role="group" aria-label="Question panels">
      <button mat-button [attr.aria-pressed]="pane() === 'outline'" (click)="pane.set('outline')">Outline</button>
      <button mat-button [attr.aria-pressed]="pane() === 'editor'" (click)="pane.set('editor')">Question editor</button>
    </div>
    <div class="question-workspace__workspace">
      <ngx-assessment-panel heading="Question outline" eyebrow="ASSESSMENTS / QUESTIONS" shape="chamfered" [class.question-workspace__hidden]="pane() !== 'outline'">
      <ngx-question-outline
        [vm]="vm"
        (searchChange)="vm.find($event)"
        (incompleteChange)="vm.filterIncomplete($event)"
        (questionSelect)="selectQuestion($event)"
        (clear)="vm.clearFilters()"
        (pageChange)="vm.page.set($event)"
      />
      </ngx-assessment-panel>
      <ngx-assessment-panel heading="Selected question editor" eyebrow="ASSESSMENTS / AUTHORING" background="grid" [resetKey]="vm.selected()" [class.question-workspace__hidden]="pane() !== 'editor'">
      <section class="question-workspace__question-editor">
        <div class="question-workspace__status-message" role="status">
          {{ vm.announcement() }}
          @if (vm.removed()) {
            <button mat-button ngxButton surface="glass" (click)="vm.undo()">
              Undo removal
            </button>
          }
        </div>
        @if (vm.selected(); as q) {
          <div class="question-workspace__editor-header">
            <div>
              <p class="question-workspace__eyebrow">
                {{
                  q.valid ? 'Ready for review' : 'Work in progress'
                }}
              </p>
              <h2 #editorHeading tabindex="-1">
                Question {{ vm.selectedIndex() + 1 }}
                <span class="question-workspace__muted"
                  >of {{ vm.questions().length }}</span
                >
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
              mat-stroked-button ngxButton surface="outline"
              [disabled]="vm.selectedIndex() === 0"
              (click)="vm.adjacent(-1)"
            >
              <mat-icon>chevron_left</mat-icon>Previous question</button
            ><button
              mat-stroked-button ngxButton surface="outline"
              [disabled]="
                vm.selectedIndex() === vm.questions().length - 1
              "
              (click)="vm.adjacent(1)"
            >
              Next question<mat-icon>chevron_right</mat-icon>
            </button>
          </div>
        }
      </section>
      </ngx-assessment-panel>
    </div>
  `,
  styles: [`
    :host { display: flex; flex-direction: column; height: 100%; min-height: 0; min-width: 0; color: var(--ngx-color-text); }
    h2, p { margin: 0; }
    h2 { font-size: 1rem; }
    .question-workspace__eyebrow { color: var(--ngx-color-primary); font: var(--ngx-font-label); font-size: 0.65rem; margin-bottom: 4px; }
    .question-workspace__workspace-summary .question-workspace__eyebrow { display: none; }
    .question-workspace__workspace-summary, .question-workspace__summary-actions, .question-workspace__editor-header, .question-workspace__question-pagination { display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; }
    .question-workspace__workspace-summary p, .question-workspace__count, .question-workspace__muted { color: var(--ngx-color-muted); font-size: 0.75rem; }
    .question-workspace__workspace-summary { padding: 2px 4px; }
    .question-workspace__summary-actions button { font-size: 0.75rem; padding-inline: 10px; }
    .question-workspace__completion-track { flex-shrink: 0; height: 3px; margin: 6px 0; background: var(--ngx-color-border); }
    .question-workspace__completion-track span { display: block; height: 100%; background: var(--ngx-color-primary); }
    .question-workspace__workspace { display: grid; grid-template-columns: 300px minmax(0, 1fr); grid-template-rows: minmax(0, 1fr); gap: 1rem; flex: 1; min-height: 0; }
    .question-workspace__question-editor { min-width: 0; }
    .question-workspace__editor-header { flex-wrap: wrap; border-bottom: 1px solid var(--ngx-color-border); padding-bottom: 8px; margin-bottom: 12px; }
    .question-workspace__status-message { font-size: 0.75rem; color: var(--ngx-color-primary); }
    .question-workspace__status-message:empty { display: none; }
    .question-workspace__question-pagination { flex-wrap: wrap; padding-top: 8px; border-top: 1px solid var(--ngx-color-border); }
    h2:focus-visible { outline: 2px solid var(--ngx-color-primary); outline-offset: 2px; }
    .question-workspace__switch { display: none; }
    @media (max-width: 1000px) {
      .question-workspace__workspace { grid-template-columns: minmax(0, 1fr); }
      .question-workspace__switch { display: flex; flex-shrink: 0; }
      .question-workspace__switch button[aria-pressed='true'] { background: var(--ngx-color-surface-high); }
      ngx-assessment-panel { grid-row: 1; grid-column: 1; }
      .question-workspace__hidden { display: none; }
    }
    @media (max-width: 600px) {
      .question-workspace__workspace-summary h2 { display: none; }
      .question-workspace__summary-actions { gap: 2px; }
      .question-workspace__summary-actions button { font-size: 0.65rem; padding-inline: 4px; min-width: 0; }
      .question-workspace__summary-actions mat-icon { display: none; }
      .question-workspace__question-pagination button { font-size: 0.7rem; padding-inline: 4px; }
    }
    @media (max-height: 650px) and (max-width: 1000px) {
      .question-workspace__workspace-summary { padding: 0; }
      .question-workspace__workspace-summary p, .question-workspace__completion-track { display: none; }
      .question-workspace__workspace-summary { justify-content: flex-end; }
      .question-workspace__summary-actions button { min-height: 32px; height: 32px; }
      .question-workspace__switch button { min-height: 32px; height: 32px; }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuestionWorkspaceComponent {
  readonly pane = signal<'outline' | 'editor'>('editor');
  readonly form = input.required<AssessmentTestForm>();
  readonly requestedQuestion = input<Question | null>(null);
  readonly selectionChange = output<Question>();
  private readonly forms = inject(AssessmentTestFormService);
  private readonly injector = inject(Injector);
  private readonly heading =
    viewChild<ElementRef<HTMLElement>>('editorHeading');
  readonly vm = new QuestionWorkspaceViewModel(
    this.forms,
    this.form,
    this.requestedQuestion,
    (question) => { this.pane.set('editor'); this.selectionChange.emit(question); },
    () => afterNextRender(() => this.heading()?.nativeElement.focus({ preventScroll: true }), { injector: this.injector })
  );

  selectQuestion(question: Question) {
    this.pane.set('editor');
    this.vm.select(question);
  }
  showInvalid(question: Question) {
    this.pane.set('editor');
    this.vm.showInvalid(question);
  }
  addChoice(question: Question) {
    this.forms.addChoice(question);
  }
  removeChoice(question: Question, index: number) {
    this.forms.removeChoice(question, index);
  }
}
