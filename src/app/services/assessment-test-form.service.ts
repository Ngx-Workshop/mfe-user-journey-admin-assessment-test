import { Injectable } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
  ValidatorFn,
} from '@angular/forms';
import {
  AssessmentTestDto,
  TestChoiceDto,
  TestQuestionDto,
} from '@tmdjr/service-nestjs-assessment-test-contracts';

import { AssessmentSubject, AssessmentTestPayload } from '../models/assessment-test';

const nonBlank: ValidatorFn = (control) =>
  typeof control.value === 'string' && control.value.trim() ? null : { required: true };
const integer: ValidatorFn = (control) =>
  Number.isInteger(control.value) ? null : { integer: true };
const validChoices: ValidatorFn = (control) => {
  const q = control.getRawValue();
  const choices: string[] = q.choices.map((value: string) => value.trim());
  if (new Set(choices).size !== choices.length) return { duplicateChoices: true };
  return choices.includes(q.answer.trim()) ? null : { answerChoice: true };
};

export type { AssessmentSubject, AssessmentTestPayload } from '../models/assessment-test';

export type TestQuestionForm = {
  question: FormControl<string>;
  choices: FormArray<FormControl<string>>;
  answer: FormControl<string>;
  correctResponse: FormControl<string>;
  incorrectResponse: FormControl<string>;
};

export type AssessmentTestForm = FormGroup<{
  name: FormControl<string>;
  subject: FormControl<AssessmentSubject>;
  level: FormControl<number>;
  testQuestions: FormArray<FormGroup<TestQuestionForm>>;
}>;

@Injectable({ providedIn: 'root' })
export class AssessmentTestFormService {
  constructor(private readonly fb: FormBuilder) {}

  createForm(initial?: Partial<AssessmentTestDto>): AssessmentTestForm {
    return this.fb.group({
      name: this.fb.control(initial?.name ?? '', {
        validators: [nonBlank, Validators.maxLength(160)],
        nonNullable: true,
      }),
      subject: this.fb.control<AssessmentSubject>(initial?.subject ?? 'ANGULAR', {
        validators: [nonBlank],
        nonNullable: true,
      }),
      level: this.fb.control(initial?.level ?? 1, {
        validators: [Validators.required, Validators.min(1), integer],
        nonNullable: true,
      }),
      testQuestions: this.fb.array(
        (initial?.testQuestions?.length
          ? initial.testQuestions
          : [this.buildDefaultQuestion()]
        ).map((q) => this.createQuestionGroup(q)),
        { validators: [Validators.required, Validators.minLength(1)] }
      ),
    });
  }

  createQuestionGroup(initial?: Partial<TestQuestionDto>): FormGroup<TestQuestionForm> {
    const choices =
      initial?.choices?.length && initial.choices.length > 0
        ? initial.choices
        : this.buildDefaultChoices();

    return this.fb.group(
      {
        question: this.fb.control(initial?.question ?? '', {
          validators: [nonBlank, Validators.maxLength(1000)],
          nonNullable: true,
        }),
        choices: this.fb.array(
          choices.map((c) => this.createChoiceControl(c.value)),
          {
            validators: [Validators.minLength(2)],
          }
        ),
        answer: this.fb.control(initial?.answer ?? '', {
          validators: [nonBlank],
          nonNullable: true,
        }),
        correctResponse: this.fb.control(initial?.correctResponse ?? '', {
          validators: [nonBlank, Validators.maxLength(1000)],
          nonNullable: true,
        }),
        incorrectResponse: this.fb.control(initial?.incorrectResponse ?? '', {
          validators: [nonBlank, Validators.maxLength(1000)],
          nonNullable: true,
        }),
      },
      { validators: [validChoices] }
    );
  }

  addQuestion(form: AssessmentTestForm) {
    form.markAsDirty();
    form.controls.testQuestions.push(this.createQuestionGroup());
  }

  removeQuestion(form: AssessmentTestForm, index: number) {
    if (form.controls.testQuestions.length <= 1) return;
    form.markAsDirty();
    form.controls.testQuestions.removeAt(index);
  }

  addChoice(question: FormGroup<TestQuestionForm>) {
    question.markAsDirty();
    question.controls.choices.push(this.createChoiceControl(''));
  }

  removeChoice(question: FormGroup<TestQuestionForm>, index: number) {
    if (question.controls.choices.length <= 2) return;
    question.markAsDirty();
    question.controls.choices.removeAt(index);
  }

  toPayload(form: AssessmentTestForm): AssessmentTestPayload {
    const raw = form.getRawValue();

    return {
      name: raw.name.trim(),
      subject: raw.subject,
      level: raw.level,
      testQuestions: raw.testQuestions.map((q) => ({
        question: q.question.trim(),
        choices: q.choices.map((value) => ({ value: value.trim() })),
        answer: q.answer.trim(),
        correctResponse: q.correctResponse.trim(),
        incorrectResponse: q.incorrectResponse.trim(),
      })),
    };
  }

  private createChoiceControl(value = ''): FormControl<string> {
    return this.fb.control(value, {
      validators: [nonBlank, Validators.maxLength(400)],
      nonNullable: true,
    });
  }

  private buildDefaultQuestion(): TestQuestionDto {
    return {
      question: '',
      choices: this.buildDefaultChoices(),
      answer: '',
      correctResponse: '',
      incorrectResponse: '',
    };
  }

  private buildDefaultChoices(): TestChoiceDto[] {
    return [{ value: 'Choice A' }, { value: 'Choice B' }];
  }
}
