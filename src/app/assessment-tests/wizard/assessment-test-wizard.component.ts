import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  HostListener,
  inject,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { distinctUntilChanged, map, merge, Subject, switchMap, tap } from 'rxjs';
import { AssessmentWizardHeadingComponent } from './assessment-wizard-heading.component';
import { AssessmentWizardControlsComponent } from './assessment-wizard-controls.component';
import { QuestionWorkspaceComponent } from '../question-workspace/question-workspace.component';
import { AssessmentBasicsComponent } from './assessment-basics.component';
import { AssessmentReviewComponent } from './assessment-review.component';
import { AssessmentWizardViewModel } from './assessment-wizard.view-model';
import { AssessmentTestFormService } from '../../services/assessment-test-form.service';
import { AssessmentEditorStore } from '../../state/assessment-editor.store';

@Component({
  selector: 'ngx-assessment-test-wizard',
  imports: [
    AssessmentWizardHeadingComponent,
    AssessmentWizardControlsComponent,
    QuestionWorkspaceComponent,
    AssessmentBasicsComponent,
    AssessmentReviewComponent,
    MatButtonModule,
    MatProgressBarModule,
    MatSnackBarModule,
  ],
  template: `
    <section class="assessment-wizard__page">
      <ngx-assessment-wizard-heading
        [name]="form.controls.name.value"
        [dirty]="form.dirty"
        [mode]="mode()"
        [step]="vm.step()"
      />

      @if (error()) {
        <div class="assessment-wizard__error" role="alert">
          {{ error() }}
          @if (loadFailed()) {
            <button mat-stroked-button (click)="retry()">Retry loading</button>
          }
        </div>
      }
      <fieldset
        class="assessment-wizard__editor"
        [disabled]="loading() || saving() || loadFailed()"
        [attr.aria-busy]="loading() || saving()"
        [attr.inert]="loading() || saving() || loadFailed() ? '' : null"
      >
        <ngx-assessment-wizard-controls
          [step]="vm.step()"
          [mode]="mode()"
          [saving]="saving()"
          [invalid]="form.invalid"
          (stepChange)="vm.setStep($event)"
          (previous)="vm.prevStep()"
          (next)="vm.nextStep()"
          (save)="submit()"
        >
          @if (loading()) {
            <mat-progress-bar mode="indeterminate"></mat-progress-bar>
          }
          @switch (vm.step()) {
            @case (0) {
              <ngx-assessment-basics [form]="form" />
            }
            @case (1) {
              <ngx-question-workspace
                [form]="form"
                [requestedQuestion]="vm.requestedQuestion()"
                (selectionChange)="vm.requestedQuestion.set($event)"
              />
            }
            @case (2) {
              <ngx-assessment-review
                [details]="vm.reviewDetails()"
                [total]="vm.questionControls().length"
                [questions]="vm.reviewQuestions()"
                [reviewPage]="vm.reviewPage()"
                [pageCount]="vm.reviewPageCount()"
                (pageChange)="vm.reviewPage.set($event)"
                (edit)="vm.editQuestion($event)"
              />
            }
          }
        </ngx-assessment-wizard-controls>
      </fieldset>
    </section>
  `,
  styles: [
    `
      :host {
        display: block;
        min-width: 0;
      }
      .assessment-wizard__page {
        display: grid;
        gap: 1.5rem;
        padding: 1rem 0;
      }
      .assessment-wizard__editor {
        border: 0;
        padding: 0;
        margin: 0;
        min-width: 0;
        display: grid;
        gap: 1.5rem;
      }
      .assessment-wizard__error {
        color: var(--mat-sys-error);
        border-left: 3px solid currentColor;
        padding: 1rem;
        background: var(--mat-sys-error-container);
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssessmentTestWizardComponent {
  private readonly store = inject(AssessmentEditorStore);
  private readonly forms = inject(AssessmentTestFormService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly snack = inject(MatSnackBar);
  private readonly destroyRef = inject(DestroyRef);
  private readonly workspace = viewChild(QuestionWorkspaceComponent);
  private readonly retryLoad = new Subject<string>();
  readonly vm = new AssessmentWizardViewModel(this.forms, this.store, (question) =>
    this.workspace()?.showInvalid(question)
  );
  readonly loading = this.store.loading;
  readonly saving = this.store.saving;
  readonly error = this.store.error;
  readonly loadFailed = this.store.loadFailed;
  readonly mode = this.store.mode;
  get form() {
    return this.vm.form;
  }

  constructor() {
    const routeId$ = this.route.paramMap.pipe(
      map((params) => params.get('id')),
      distinctUntilChanged()
    );
    merge(routeId$.pipe(tap(() => this.vm.reset())), this.retryLoad)
      .pipe(
        switchMap((id) => this.store.open$(id)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((test) => {
        this.vm.form = this.forms.createForm(test ?? undefined);
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
    return (
      !this.saving() && (!this.form.dirty || confirm('Discard your unsaved assessment changes?'))
    );
  }
  retry() {
    const id = this.store.testId();
    if (id && !this.saving()) this.retryLoad.next(id);
  }
  goBack() {
    this.router.navigate(['.'], { relativeTo: this.route.parent });
  }
  submit() {
    if (this.saving() || this.loading() || this.loadFailed()) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.vm.setStep(2);
      return;
    }
    this.store
      .save$(this.forms.toPayload(this.form))
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.form.markAsPristine();
        this.snack.open('Assessment test saved', undefined, { duration: 2500 });
        this.goBack();
      });
  }
}
