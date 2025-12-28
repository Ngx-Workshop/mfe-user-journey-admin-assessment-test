import { Injectable } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import {
  AssessmentTestDto,
  TestChoiceDto,
  TestQuestionDto,
} from '@tmdjr/service-nestjs-assessment-test-contracts';

export type AssessmentSubject = AssessmentTestDto['subject'];

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

export type AssessmentTestPayload = {
  name: string;
  subject: AssessmentSubject;
  level: number;
  testQuestions: TestQuestionDto[];
};

@Injectable({ providedIn: 'root' })
export class AssessmentTestFormService {
  constructor(private readonly fb: FormBuilder) {}

  createForm(
    initial?: Partial<AssessmentTestDto>
  ): AssessmentTestForm {
    return this.fb.group({
      name: this.fb.control(initial?.name ?? '', {
        validators: [Validators.required, Validators.maxLength(160)],
        nonNullable: true,
      }),
      subject: this.fb.control<AssessmentSubject>(
        initial?.subject ?? 'ANGULAR',
        {
          validators: [Validators.required],
          nonNullable: true,
        }
      ),
      level: this.fb.control(initial?.level ?? 1, {
        validators: [Validators.required, Validators.min(1)],
        nonNullable: true,
      }),
      testQuestions: this.fb.array(
        (initial?.testQuestions?.length
          ? initial.testQuestions
          : [this.buildDefaultQuestion()]
        ).map((q) => this.createQuestionGroup(q)),
        { validators: [Validators.required] }
      ),
    });
  }

  createQuestionGroup(
    initial?: Partial<TestQuestionDto>
  ): FormGroup<TestQuestionForm> {
    const choices =
      initial?.choices?.length && initial.choices.length > 0
        ? initial.choices
        : this.buildDefaultChoices();

    return this.fb.group({
      question: this.fb.control(initial?.question ?? '', {
        validators: [Validators.required, Validators.maxLength(1000)],
        nonNullable: true,
      }),
      choices: this.fb.array(
        choices.map((c) => this.createChoiceControl(c.value)),
        {
          validators: [Validators.minLength(2)],
        }
      ),
      answer: this.fb.control(initial?.answer ?? '', {
        validators: [Validators.required],
        nonNullable: true,
      }),
      correctResponse: this.fb.control(
        initial?.correctResponse ?? '',
        {
          validators: [
            Validators.required,
            Validators.maxLength(1000),
          ],
          nonNullable: true,
        }
      ),
      incorrectResponse: this.fb.control(
        initial?.incorrectResponse ?? '',
        {
          validators: [
            Validators.required,
            Validators.maxLength(1000),
          ],
          nonNullable: true,
        }
      ),
    });
  }

  addQuestion(form: AssessmentTestForm) {
    form.controls.testQuestions.push(this.createQuestionGroup());
  }

  removeQuestion(form: AssessmentTestForm, index: number) {
    if (form.controls.testQuestions.length <= 1) return;
    form.controls.testQuestions.removeAt(index);
  }

  addChoice(question: FormGroup<TestQuestionForm>) {
    question.controls.choices.push(this.createChoiceControl(''));
  }

  removeChoice(question: FormGroup<TestQuestionForm>, index: number) {
    if (question.controls.choices.length <= 2) return;
    question.controls.choices.removeAt(index);
  }

  toPayload(form: AssessmentTestForm): AssessmentTestPayload {
    const raw = form.getRawValue();

    return {
      name: raw.name.trim(),
      subject: raw.subject,
      level: raw.level,
      testQuestions: raw.testQuestions
        .map((q) =>
          this.toQuestionDto(q as unknown as TestQuestionForm)
        )
        .filter((q) => q.question.trim()),
    };
  }

  private toQuestionDto(q: TestQuestionForm): TestQuestionDto {
    const base: TestQuestionDto = {
      question: q.question.value.trim(),
      choices: q.choices.controls
        .map((c) => c.value.trim())
        .filter((v) => Boolean(v))
        .map<TestChoiceDto>((v) => ({ value: v })),
      answer: q.answer.value.trim(),
      correctResponse: q.correctResponse.value.trim(),
      incorrectResponse: q.incorrectResponse.value.trim(),
    };

    return base;
  }

  private createChoiceControl(value = ''): FormControl<string> {
    return this.fb.control(value, {
      validators: [Validators.required, Validators.maxLength(400)],
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
