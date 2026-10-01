import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import {
  AssessmentTestForm,
  AssessmentTestFormService,
  TestQuestionForm,
} from '../services/assessment-test-form.service';

type Question = FormGroup<TestQuestionForm>;

@Component({
  selector: 'ngx-question-workspace',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './question-workspace.component.html',
  styleUrl: './question-workspace.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuestionWorkspaceComponent {
  readonly form = input.required<AssessmentTestForm>();
  readonly requestedQuestion = input<Question | null>(null);
  readonly selectionChange = output<Question>();
  private readonly forms = inject(AssessmentTestFormService);
  private readonly heading =
    viewChild<ElementRef<HTMLElement>>('editorHeading');
  private readonly revision = signal(0);
  readonly selected = signal<Question | null>(null);
  readonly search = signal('');
  readonly incompleteOnly = signal(false);
  readonly page = signal(0);
  readonly moveOpen = signal(false);
  readonly moveTarget = signal(1);
  readonly validMove = computed(
    () =>
      Number.isInteger(this.moveTarget()) &&
      this.moveTarget() >= 1 &&
      this.moveTarget() <= this.questions().length &&
      this.moveTarget() !== this.selectedIndex() + 1
  );
  readonly pageSize = 12;
  readonly removed = signal<{
    question: Question;
    index: number;
  } | null>(null);
  readonly announcement = signal('');
  readonly questions = computed(() => {
    this.revision();
    return [...this.form().controls.testQuestions.controls];
  });
  readonly selectedIndex = computed(() =>
    this.questions().indexOf(this.selected()!)
  );
  readonly completeCount = computed(
    () => this.questions().filter((q) => q.valid).length
  );
  readonly matches = computed(() => {
    const term = this.search().trim().toLowerCase();
    return this.questions()
      .map((question, index) => ({ question, index }))
      .filter(
        ({ question, index }) =>
          (!this.incompleteOnly() || question.invalid) &&
          (!term ||
            `${index + 1} ${question.controls.question.value}`
              .toLowerCase()
              .includes(term))
      );
  });
  readonly pageCount = computed(() =>
    Math.max(1, Math.ceil(this.matches().length / this.pageSize))
  );
  readonly currentPage = computed(() =>
    Math.min(this.page(), this.pageCount() - 1)
  );
  readonly visible = computed(() =>
    this.matches().slice(
      this.currentPage() * this.pageSize,
      (this.currentPage() + 1) * this.pageSize
    )
  );

  constructor() {
    effect((cleanup) => {
      const form = this.form();
      this.selected.set(form.controls.testQuestions.at(0));
      this.removed.set(null);
      this.search.set('');
      this.incompleteOnly.set(false);
      this.page.set(0);
      const subscription = form.valueChanges.subscribe(() =>
        this.revision.update((value) => value + 1)
      );
      cleanup(() => subscription.unsubscribe());
    });
    effect(() => {
      const requested = this.requestedQuestion();
      if (
        requested &&
        this.form().controls.testQuestions.controls.includes(
          requested
        )
      ) {
        if (untracked(this.selected) !== requested)
          this.clearFilters();
        this.selected.set(requested);
        this.heading()?.nativeElement.focus({ preventScroll: false });
        this.page.set(
          Math.floor(
            this.form().controls.testQuestions.controls.indexOf(
              requested
            ) / this.pageSize
          )
        );
      }
    });
  }

  select(question: Question, focus = true) {
    this.selected.set(question);
    this.moveOpen.set(false);
    this.selectionChange.emit(question);
    if (focus)
      this.heading()?.nativeElement.focus({ preventScroll: false });
  }
  clearFilters() {
    this.search.set('');
    this.incompleteOnly.set(false);
    this.page.set(0);
  }
  find(term: string) {
    this.search.set(term);
    this.page.set(0);
  }
  filterIncomplete(value: boolean) {
    this.incompleteOnly.set(value);
    this.page.set(0);
  }
  private reveal(question: Question) {
    this.clearFilters();
    this.page.set(
      Math.floor(
        this.form().controls.testQuestions.controls.indexOf(
          question
        ) / this.pageSize
      )
    );
    this.select(question);
  }
  add() {
    this.forms.addQuestion(this.form());
    const question =
      this.form().controls.testQuestions.controls.at(-1)!;
    this.reveal(question);
    this.announcement.set('New question added.');
  }
  duplicate() {
    const question = this.selected();
    if (!question) return;
    const raw = question.getRawValue();
    const copy = this.forms.createQuestionGroup({
      ...raw,
      choices: raw.choices.map((value) => ({ value })),
    });
    this.form().controls.testQuestions.insert(
      this.selectedIndex() + 1,
      copy
    );
    this.form().markAsDirty();
    this.reveal(copy);
    this.announcement.set(
      'Question duplicated. Edit the copy below.'
    );
  }
  openMove() {
    this.moveTarget.set(this.selectedIndex() + 1);
    this.moveOpen.set(true);
  }
  moveTo() {
    if (this.validMove())
      this.move(this.moveTarget() - 1 - this.selectedIndex());
  }
  move(offset: number) {
    const array = this.form().controls.testQuestions;
    const index = this.selectedIndex();
    const target = index + offset;
    if (index < 0 || target < 0 || target >= array.length) return;
    const question = array.at(index);
    array.removeAt(index, { emitEvent: false });
    array.insert(target, question);
    this.form().markAsDirty();
    this.reveal(question);
    this.announcement.set(
      `Question moved to position ${target + 1}.`
    );
  }
  remove() {
    const array = this.form().controls.testQuestions;
    const index = this.selectedIndex();
    if (array.length <= 1 || index < 0) return;
    this.removed.set({ question: array.at(index), index });
    this.forms.removeQuestion(this.form(), index);
    this.reveal(array.at(Math.min(index, array.length - 1)));
    this.announcement.set(
      'Question removed. Undo is available until you leave Questions or remove another question.'
    );
  }
  undo() {
    const removed = this.removed();
    if (!removed) return;
    const array = this.form().controls.testQuestions;
    array.insert(
      Math.min(removed.index, array.length),
      removed.question
    );
    this.form().markAsDirty();
    this.reveal(removed.question);
    this.removed.set(null);
    this.announcement.set('Question restored.');
  }
  adjacent(offset: number) {
    const question = this.questions()[this.selectedIndex() + offset];
    if (question) this.reveal(question);
  }
  showInvalid(question: Question) {
    question.markAllAsTouched();
    this.reveal(question);
  }
  firstIncomplete() {
    const question = this.questions().find((q) => q.invalid);
    if (question) {
      question.markAllAsTouched();
      this.reveal(question);
    }
  }
  addChoice(question: Question) {
    this.forms.addChoice(question);
  }
  removeChoice(question: Question, index: number) {
    this.forms.removeChoice(question, index);
  }
}
