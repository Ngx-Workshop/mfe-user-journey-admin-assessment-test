import { signal } from '@angular/core';
import { FormGroup } from '@angular/forms';
import {
  AssessmentTestForm,
  AssessmentTestFormService,
  TestQuestionForm,
} from '../../forms/assessment-test-form.service';
import { AssessmentEditorStore } from '../../state/assessment-editor.store';

/** Local draft and step navigation. Never retained in singleton server state. */
export class AssessmentWizardViewModel {
  private readonly draft;
  readonly requestedQuestion =
    signal<FormGroup<TestQuestionForm> | null>(null);
  readonly reviewPage = signal(0);
  readonly step = signal(0);

  constructor(
    private readonly forms: AssessmentTestFormService,
    private readonly store: AssessmentEditorStore,
    private readonly showInvalid: (
      question: FormGroup<TestQuestionForm>
    ) => void
  ) {
    this.draft = signal(forms.createForm());
  }
  get form(): AssessmentTestForm {
    return this.draft();
  }
  set form(form: AssessmentTestForm) {
    this.draft.set(form);
  }

  reset() {
    this.form = this.forms.createForm();
    this.step.set(0);
    this.reviewPage.set(0);
    this.requestedQuestion.set(null);
  }
  questionControls() {
    return this.form.controls.testQuestions.controls;
  }

  setStep(next: number) {
    if (
      this.store.loading() ||
      this.store.saving() ||
      this.store.loadFailed()
    )
      return;
    for (let i = 0; i < next; i++) {
      if (!this.validateStep(i)) {
        this.step.set(i);
        return;
      }
    }
    if (next === 2) this.reviewPage.set(0);
    this.step.set(next);
  }

  editQuestion(index: number) {
    this.requestedQuestion.set(this.questionControls()[index]);
    this.step.set(1);
  }

  reviewDetails() {
    const { name, subject, level } = this.form.controls;
    return {
      name: name.value,
      subject: subject.value,
      level: level.value,
    };
  }

  reviewQuestions() {
    return this.questionControls()
      .slice(this.reviewPage() * 10, (this.reviewPage() + 1) * 10)
      .map((question) => question.getRawValue());
  }
  reviewPageCount() {
    return Math.ceil(this.questionControls().length / 10);
  }

  nextStep() {
    this.setStep(Math.min(2, this.step() + 1));
  }

  prevStep() {
    this.step.update((s) => Math.max(0, s - 1));
  }

  private validateStep(current: number): boolean {
    if (current === 0) {
      const controls = [
        this.form.controls.name,
        this.form.controls.subject,
        this.form.controls.level,
      ];
      controls.forEach((c) => c.markAsTouched());
      return controls.every((c) => c.valid);
    }

    if (current === 1) {
      this.form.controls.testQuestions.markAllAsTouched();
      const invalid = this.questionControls().find(
        (question) => question.invalid
      );
      if (invalid) {
        this.requestedQuestion.set(invalid);
        this.showInvalid(invalid);
      }
      return this.form.controls.testQuestions.valid;
    }

    return true;
  }
}
