import { computed, effect, Signal, signal, untracked } from '@angular/core';
import { map, merge, startWith } from 'rxjs';
import { FormGroup } from '@angular/forms';
import {
  AssessmentTestForm,
  AssessmentTestFormService,
  TestQuestionForm,
} from '../../services/assessment-test-form.service';
export type Question = FormGroup<TestQuestionForm>;

/** Per-workspace selection, filtering and structural edits preserve control identity. */
export class QuestionWorkspaceViewModel {
  private readonly questionSnapshot = signal<{
    form: AssessmentTestForm;
    questions: Question[];
  } | null>(null);
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
    const form = this.form();
    const snapshot = this.questionSnapshot();
    return snapshot?.form === form ? snapshot.questions : [...form.controls.testQuestions.controls];
  });
  readonly selectedIndex = computed(() => this.questions().indexOf(this.selected()!));
  readonly completeCount = computed(() => this.questions().filter((q) => q.valid).length);
  readonly matches = computed(() => {
    const term = this.search().trim().toLowerCase();
    return this.questions()
      .map((question, index) => ({ question, index }))
      .filter(
        ({ question, index }) =>
          (!this.incompleteOnly() || question.invalid) &&
          (!term || `${index + 1} ${question.controls.question.value}`.toLowerCase().includes(term))
      );
  });
  readonly pageCount = computed(() =>
    Math.max(1, Math.ceil(this.matches().length / this.pageSize))
  );
  readonly currentPage = computed(() => Math.min(this.page(), this.pageCount() - 1));
  readonly visible = computed(() =>
    this.matches().slice(
      this.currentPage() * this.pageSize,
      (this.currentPage() + 1) * this.pageSize
    )
  );

  constructor(
    private readonly forms: AssessmentTestFormService,
    readonly form: Signal<AssessmentTestForm>,
    private readonly requestedQuestion: Signal<Question | null>,
    private readonly selectionChange: (question: Question) => void,
    private readonly focusHeading: () => void
  ) {
    // Keep the bridge in the shared Angular core context: interop helpers can
    // resolve a different core instance when the remote is mounted in the shell.
    effect((cleanup) => {
      const form = this.form();
      const subscription = merge(form.valueChanges, form.statusChanges)
        .pipe(
          startWith(null),
          map(() => ({ form, questions: [...form.controls.testQuestions.controls] }))
        )
        .subscribe((snapshot) => this.questionSnapshot.set(snapshot));
      cleanup(() => subscription.unsubscribe());
      this.selected.set(form.controls.testQuestions.at(0));
      this.removed.set(null);
      this.moveOpen.set(false);
      this.moveTarget.set(1);
      this.announcement.set('');
      this.search.set('');
      this.incompleteOnly.set(false);
      this.page.set(0);
    });
    effect(() => {
      const requested = this.requestedQuestion();
      if (requested && this.form().controls.testQuestions.controls.includes(requested)) {
        if (untracked(this.selected) !== requested) this.clearFilters();
        this.selected.set(requested);
        this.focusHeading();
        this.page.set(
          Math.floor(this.form().controls.testQuestions.controls.indexOf(requested) / this.pageSize)
        );
      }
    });
  }

  select(question: Question, focus = true) {
    this.selected.set(question);
    this.moveOpen.set(false);
    this.selectionChange(question);
    if (focus) this.focusHeading();
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
      Math.floor(this.form().controls.testQuestions.controls.indexOf(question) / this.pageSize)
    );
    this.select(question);
  }
  add() {
    this.forms.addQuestion(this.form());
    const question = this.form().controls.testQuestions.controls.at(-1)!;
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
    this.form().controls.testQuestions.insert(this.selectedIndex() + 1, copy);
    this.form().markAsDirty();
    this.reveal(copy);
    this.announcement.set('Question duplicated. Edit the copy below.');
  }
  openMove() {
    this.moveTarget.set(this.selectedIndex() + 1);
    this.moveOpen.set(true);
  }
  moveTo() {
    if (this.validMove()) this.move(this.moveTarget() - 1 - this.selectedIndex());
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
    this.announcement.set(`Question moved to position ${target + 1}.`);
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
    array.insert(Math.min(removed.index, array.length), removed.question);
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
}
