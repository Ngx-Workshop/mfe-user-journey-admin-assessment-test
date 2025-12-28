import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  signal,
} from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import {
  MatSnackBar,
  MatSnackBarModule,
} from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import {
  AssessmentSubject,
  AssessmentTestForm,
  AssessmentTestFormService,
  TestQuestionForm,
} from '../services/assessment-test-form.service';
import { AssessmentTestsApiService } from '../services/assessment-tests-api.service';

@Component({
  selector: 'ngx-assessment-test-wizard',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatDividerModule,
    MatProgressBarModule,
    MatSnackBarModule,
  ],
  template: `
    <section class="page">
      <header class="page-header">
        <button mat-button (click)="goBack()">
          <mat-icon>arrow_back</mat-icon>
          Back
        </button>
        <div class="titles">
          <p class="eyebrow">Assessment wizard</p>
          <h1>
            {{
              mode() === 'create'
                ? 'Create assessment test'
                : 'Edit assessment test'
            }}
          </h1>
          <p class="lede">
            Move through details, questions, and review to publish
            your assessment.
          </p>
        </div>
        <div class="progress">
          <div class="dot" [class.active]="step() >= 0"></div>
          <div class="dot" [class.active]="step() >= 1"></div>
          <div class="dot" [class.active]="step() >= 2"></div>
        </div>
      </header>

      <nav class="steps">
        <button
          mat-stroked-button
          [class.active]="step() === 0"
          (click)="setStep(0)"
        >
          <span class="step-num">1</span>
          Basics
        </button>
        <button
          mat-stroked-button
          [class.active]="step() === 1"
          (click)="setStep(1)"
        >
          <span class="step-num">2</span>
          Questions
        </button>
        <button
          mat-stroked-button
          [class.active]="step() === 2"
          (click)="setStep(2)"
        >
          <span class="step-num">3</span>
          Review
        </button>
      </nav>

      @if (loading()) {
      <mat-progress-bar mode="indeterminate"></mat-progress-bar>
      } @switch (step()) { @case (0) {
      <mat-card class="panel">
        <mat-card-header>
          <mat-card-title>Basics</mat-card-title>
          <mat-card-subtitle
            >Set name, subject, and level.</mat-card-subtitle
          >
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="form" class="grid">
            <mat-form-field appearance="outline" class="full">
              <mat-label>Name</mat-label>
              <input matInput formControlName="name" required />
              @if(form.controls.name.hasError('required')) {
              <mat-error>Required</mat-error>
              } @if(form.controls.name.hasError('maxlength')) {
              <mat-error>Too long</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Subject</mat-label>
              <mat-select formControlName="subject" required>
                @for (s of subjects; track s) {
                <mat-option [value]="s">{{ s }}</mat-option>
                }
              </mat-select>
              @if(form.controls.subject.hasError('required')) {
              <mat-error>Pick a subject</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Level</mat-label>
              <input
                matInput
                type="number"
                min="1"
                formControlName="level"
                required
              />
              @if(form.controls.level.hasError('min')) {
              <mat-error>Level must be at least 1</mat-error>
              }
            </mat-form-field>
          </form>
        </mat-card-content>
      </mat-card>
      } @case (1) {
      <mat-card class="panel">
        <mat-card-header>
          <mat-card-title>Questions</mat-card-title>
          <mat-card-subtitle
            >Draft each prompt and choices.</mat-card-subtitle
          >
        </mat-card-header>
        <mat-card-content class="questions">
          <div class="questions-head">
            <p class="hint">Min 1 question, min 2 choices each.</p>
            <button mat-stroked-button (click)="addQuestion()">
              <mat-icon>add</mat-icon>
              Add question
            </button>
          </div>

          @for (q of questionControls(); track q; let i = $index) {
          <mat-card class="question-card" [formGroup]="q">
            <div class="question-title">
              <div class="title-text">
                <span class="badge">{{ i + 1 }}</span>
                <h3>Question {{ i + 1 }}</h3>
              </div>
              <button
                mat-icon-button
                (click)="removeQuestion(i)"
                [disabled]="questionControls().length <= 1"
              >
                <mat-icon>delete</mat-icon>
              </button>
            </div>

            <mat-form-field appearance="outline" class="full">
              <mat-label>Prompt</mat-label>
              <textarea
                matInput
                formControlName="question"
                rows="3"
                required
              ></textarea>
              @if(q.controls.question.hasError('required')) {
              <mat-error>Required</mat-error>
              }
            </mat-form-field>

            <div formArrayName="choices" class="choices">
              <div class="choices-head">
                <h4>Choices</h4>
                <button mat-button (click)="addChoice(q)">
                  <mat-icon>add</mat-icon>
                  Add choice
                </button>
              </div>
              @for (c of q.controls.choices.controls; track c; let ci
              = $index) {
              <mat-form-field appearance="outline" class="choice">
                <mat-label>Choice {{ ci + 1 }}</mat-label>
                <input matInput [formControlName]="ci" />
                @if(q.controls.choices.length > 2) {
                <button
                  mat-icon-button
                  matSuffix
                  (click)="removeChoice(q, ci)"
                >
                  <mat-icon>close</mat-icon>
                </button>
                }
              </mat-form-field>
              }
            </div>

            <div class="answers">
              <mat-form-field appearance="outline" class="full">
                <mat-label>Correct Answer</mat-label>
                <mat-select formControlName="answer" required>
                  @for (opt of q.controls.choices.controls; track opt;
                  let oi = $index) {
                  <mat-option [value]="opt.value">
                    Choice {{ oi + 1 }} — {{ opt.value }}
                  </mat-option>
                  }
                </mat-select>
                @if(q.controls.answer.hasError('required')) {
                <mat-error>Pick an answer</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline" class="full">
                <mat-label>Correct Response</mat-label>
                <textarea
                  matInput
                  formControlName="correctResponse"
                  rows="2"
                  required
                ></textarea>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full">
                <mat-label>Incorrect Response</mat-label>
                <textarea
                  matInput
                  formControlName="incorrectResponse"
                  rows="2"
                  required
                ></textarea>
              </mat-form-field>
            </div>
          </mat-card>
          }
        </mat-card-content>
      </mat-card>
      } @case (2) {
      <mat-card class="panel">
        <mat-card-header>
          <mat-card-title>Review</mat-card-title>
          <mat-card-subtitle
            >Double check before saving.</mat-card-subtitle
          >
        </mat-card-header>
        <mat-card-content class="review">
          <div>
            <p class="label">Name</p>
            <p class="value">{{ form.value.name }}</p>
          </div>
          <div>
            <p class="label">Subject</p>
            <p class="value">{{ form.value.subject }}</p>
          </div>
          <div>
            <p class="label">Level</p>
            <p class="value">{{ form.value.level }}</p>
          </div>
          <div>
            <p class="label">Questions</p>
            <div class="review-questions">
              @for (q of form.value.testQuestions ?? []; track q; let
              i = $index) {
              <div class="review-question">
                <p class="q-title">{{ i + 1 }}. {{ q?.question }}</p>
                <ul>
                  @for (c of q?.choices ?? []; track c) {
                  <li [class.correct]="c === q?.answer">
                    {{ c }}
                  </li>
                  }
                </ul>
              </div>
              }
            </div>
          </div>
        </mat-card-content>
      </mat-card>
      } }

      <footer class="footer">
        <div class="footer-left">
          <button
            mat-stroked-button
            (click)="prevStep()"
            [disabled]="step() === 0"
          >
            Back
          </button>
        </div>
        <div class="footer-right">
          @if (step() < 2) {
          <button
            mat-flat-button
            color="primary"
            (click)="nextStep()"
          >
            Next
          </button>
          } @else {
          <button
            mat-flat-button
            color="primary"
            [disabled]="form.invalid || saving()"
            (click)="submit()"
          >
            {{ mode() === 'create' ? 'Create test' : 'Save changes' }}
          </button>
          }
        </div>
      </footer>
    </section>
  `,
  styles: [
    `
      .page {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        padding: 1rem;
        max-width: 1080px;
        margin: 0 auto;
      }
      .page-header {
        display: grid;
        grid-template-columns: auto 1fr auto;
        gap: 1rem;
        align-items: center;
      }
      .titles h1 {
        margin: 0;
      }
      .titles .lede {
        margin: 0.15rem 0 0;
        opacity: 0.8;
      }
      .eyebrow {
        text-transform: uppercase;
        letter-spacing: 0.08em;
        font-size: 0.78rem;
        margin: 0;
        color: var(--mat-sys-secondary);
      }
      .progress {
        display: flex;
        gap: 0.35rem;
        align-items: center;
      }
      .dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background: rgba(0, 0, 0, 0.12);
      }
      .dot.active {
        background: var(--mat-sys-primary);
      }
      .steps {
        display: flex;
        gap: 0.5rem;
        flex-wrap: wrap;
      }
      .steps button {
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
      }
      .steps button.active {
        border-color: var(--mat-sys-primary);
        color: var(--mat-sys-primary);
        background: rgba(0, 0, 0, 0.02);
      }
      .step-num {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 22px;
        height: 22px;
        border-radius: 50%;
        background: var(--mat-sys-primary-container);
        color: var(--mat-sys-on-primary-container);
        font-weight: 600;
      }
      .panel {
        padding: 0.75rem;
      }
      .grid {
        display: grid;
        grid-template-columns: 1fr 240px 160px;
        gap: 0.75rem;
      }
      .full {
        width: 100%;
      }
      .questions {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }
      .questions-head {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .question-card {
        padding: 0.75rem;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        border: 1px solid rgba(0, 0, 0, 0.08);
        border-radius: 12px;
      }
      .question-title {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .title-text {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }
      .badge {
        background: var(--mat-sys-primary);
        color: var(--mat-sys-on-primary);
        border-radius: 50%;
        width: 28px;
        height: 28px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-weight: 700;
      }
      .choices {
        display: flex;
        flex-direction: column;
        gap: 0.35rem;
      }
      .choices-head {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .choice {
        width: 100%;
      }
      .answers {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
        gap: 0.5rem;
      }
      .hint {
        margin: 0;
        opacity: 0.7;
      }
      .footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.5rem 0 1.5rem;
      }
      .review {
        display: grid;
        gap: 0.75rem;
      }
      .label {
        margin: 0;
        opacity: 0.7;
        font-weight: 600;
      }
      .value {
        margin: 0.15rem 0 0;
        font-size: 1rem;
      }
      .review-questions {
        display: grid;
        gap: 0.75rem;
      }
      .review-question {
        border: 1px solid rgba(0, 0, 0, 0.08);
        border-radius: 8px;
        padding: 0.5rem 0.75rem;
      }
      .review-question ul {
        margin: 0.5rem 0 0;
        padding-left: 1.25rem;
      }
      .review-question li.correct {
        color: var(--mat-sys-primary);
        font-weight: 600;
      }
      @media (max-width: 900px) {
        .page-header {
          grid-template-columns: 1fr;
          align-items: flex-start;
        }
        .grid {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssessmentTestWizardComponent {
  private readonly api = inject(AssessmentTestsApiService);
  private readonly formSvc = inject(AssessmentTestFormService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly snack = inject(MatSnackBar);

  readonly subjects: AssessmentSubject[] = [
    'ANGULAR',
    'NESTJS',
    'RXJS',
  ];
  readonly step = signal(0);
  readonly mode = signal<'create' | 'edit'>('create');
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly testId = signal<string | null>(null);

  form: AssessmentTestForm = this.formSvc.createForm();

  constructor() {
    effect(() => {
      const id = this.route.snapshot.paramMap.get('id');
      if (!id) return;
      this.mode.set('edit');
      this.testId.set(id);
      this.fetch(id);
    });
  }

  questionControls() {
    return this.form.controls.testQuestions.controls;
  }

  setStep(next: number) {
    if (next > this.step()) {
      const ok = this.validateStep(this.step());
      if (!ok) return;
    }
    this.step.set(next);
  }

  nextStep() {
    const ok = this.validateStep(this.step());
    if (!ok) return;
    this.step.update((s) => Math.min(2, s + 1));
  }

  prevStep() {
    this.step.update((s) => Math.max(0, s - 1));
  }

  addQuestion() {
    this.formSvc.addQuestion(this.form);
  }

  removeQuestion(index: number) {
    this.formSvc.removeQuestion(this.form, index);
  }

  addChoice(question: FormGroup<TestQuestionForm>) {
    this.formSvc.addChoice(question);
  }

  removeChoice(question: FormGroup<TestQuestionForm>, index: number) {
    this.formSvc.removeChoice(question, index);
  }

  goBack() {
    this.router.navigate(['../../'], { relativeTo: this.route });
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload = this.formSvc.toPayload(this.form);
    this.saving.set(true);

    if (this.mode() === 'create') {
      this.api
        .create$(payload)
        .pipe(finalize(() => this.saving.set(false)))
        .subscribe((created) => {
          this.snack.open('Assessment test created', undefined, {
            duration: 2500,
          });
          this.router.navigate(['../../'], {
            relativeTo: this.route,
          });
        });
      return;
    }

    const id = this.testId();
    if (!id) {
      this.router.navigate(['../../'], { relativeTo: this.route });
      return;
    }

    this.api
      .update$({ ...payload, _id: id })
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe((updated) => {
        this.snack.open('Assessment test updated', undefined, {
          duration: 2500,
        });
        this.router.navigate(['../../'], { relativeTo: this.route });
      });
  }

  private fetch(id: string) {
    this.loading.set(true);
    this.api
      .get$(id)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe((test) => {
        this.form = this.formSvc.createForm(test);
      });
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
      return this.form.controls.testQuestions.valid;
    }

    return true;
  }
}
