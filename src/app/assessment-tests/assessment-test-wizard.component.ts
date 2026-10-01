import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  HostListener,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
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
import { finalize, Subscription } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { QuestionWorkspaceComponent } from './question-workspace.component';
import { apiError } from '../services/api-error';
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
    ReactiveFormsModule,
    QuestionWorkspaceComponent,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatProgressBarModule,
    MatSnackBarModule,
  ],
  templateUrl: './assessment-test-wizard.component.html',
  styleUrl: './assessment-test-wizard.component.scss',
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
  private readonly workspace = viewChild(QuestionWorkspaceComponent);
  readonly requestedQuestion =
    signal<FormGroup<TestQuestionForm> | null>(null);
  readonly reviewPage = signal(0);
  readonly step = signal(0);
  readonly mode = signal<'create' | 'edit'>('create');
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly testId = signal<string | null>(null);

  form: AssessmentTestForm = this.formSvc.createForm();

  private readonly destroyRef = inject(DestroyRef);
  readonly error = signal<string | null>(null);
  readonly loadFailed = signal(false);
  private version = 0;
  private request?: Subscription;

  constructor() {
    this.route.paramMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        this.request?.unsubscribe();
        const id = params.get('id');
        this.testId.set(id);
        this.mode.set(id ? 'edit' : 'create');
        this.step.set(0);
        this.requestedQuestion.set(null);
        this.reviewPage.set(0);
        this.error.set(null);
        this.loadFailed.set(false);
        this.form = this.formSvc.createForm();
        if (id) this.fetch(id);
      });
  }

  @HostListener('window:beforeunload', ['$event'])
  beforeUnload(event: BeforeUnloadEvent) {
    if (this.form.dirty || this.saving()) {
      event.preventDefault();
      event.returnValue = '';
    }
  }

  canLeave() {
    if (this.saving()) return false;
    return (
      !this.form.dirty ||
      confirm('Discard your unsaved assessment changes?')
    );
  }

  retry() {
    const id = this.testId();
    if (id) this.fetch(id);
  }

  questionControls() {
    return this.form.controls.testQuestions.controls;
  }

  setStep(next: number) {
    if (this.loading() || this.saving() || this.loadFailed()) return;
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

  reviewQuestions() {
    return this.form
      .getRawValue()
      .testQuestions.slice(
        this.reviewPage() * 10,
        (this.reviewPage() + 1) * 10
      );
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

  goBack() {
    this.router.navigate(['.'], { relativeTo: this.route.parent });
  }

  submit() {
    if (this.saving() || this.loading() || this.loadFailed()) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.setStep(2);
      return;
    }
    const payload = this.formSvc.toPayload(this.form);
    this.saving.set(true);
    this.error.set(null);
    const request =
      this.mode() === 'create'
        ? this.api.create$(payload)
        : this.api.update$({
            ...payload,
            _id: this.testId()!,
            __v: this.version,
          });
    request
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.saving.set(false))
      )
      .subscribe({
        next: () => {
          this.form.markAsPristine();
          this.saving.set(false);
          this.snack.open('Assessment test saved', undefined, {
            duration: 2500,
          });
          this.goBack();
        },
        error: (error) =>
          this.error.set(
            apiError(
              error,
              'Could not save this test. Your changes are still here. Please retry.'
            )
          ),
      });
  }

  private fetch(id: string) {
    this.request?.unsubscribe();
    this.loading.set(true);
    this.loadFailed.set(false);
    this.error.set(null);
    this.request = this.api
      .get$(id)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.loading.set(false))
      )
      .subscribe({
        next: (test) => {
          this.version = test.__v;
          this.form = this.formSvc.createForm(test);
        },
        error: (error) => {
          this.loadFailed.set(true);
          this.error.set(
            apiError(error, 'Could not load this test. Please retry.')
          );
        },
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
      const invalid = this.questionControls().find(
        (question) => question.invalid
      );
      if (invalid) {
        this.requestedQuestion.set(invalid);
        this.workspace()?.showInvalid(invalid);
      }
      return this.form.controls.testQuestions.valid;
    }

    return true;
  }
}
