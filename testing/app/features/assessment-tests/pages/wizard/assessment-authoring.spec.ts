import { DocumentSectionsApiService } from '../../../../../../src/app/features/assessment-tests/api/document-sections-api.service';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BehaviorSubject, of, Subject, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { AssessmentTestFormService } from '../../../../../../src/app/features/assessment-tests/forms/assessment-test-form.service';
import { AssessmentTestsApiService } from '../../../../../../src/app/features/assessment-tests/api/assessment-tests-api.service';
import { AssessmentTestListComponent } from '../../../../../../src/app/features/assessment-tests/pages/catalog/assessment-test-list.component';
import { AssessmentTestWizardComponent } from '../../../../../../src/app/features/assessment-tests/pages/wizard/assessment-test-wizard.component';

const test = {
  _id: '123',
  __v: 2,
  name: 'Test',
  subject: 'ANGULAR',
  sectionTitle: 'Angular',
  level: 1,
  lastUpdated: '',
  testQuestions: [
    {
      question: 'Pick A',
      choices: [{ value: 'A' }, { value: 'B' }],
      answer: 'A',
      correctResponse: 'Yes',
      incorrectResponse: 'No',
    },
  ],
};
describe('assessment authoring failures and navigation', () => {
  let api: jasmine.SpyObj<AssessmentTestsApiService>;
  let router: jasmine.SpyObj<Router>;
  let snack: jasmine.SpyObj<MatSnackBar>;
  let params: BehaviorSubject<ReturnType<typeof convertToParamMap>>;
  beforeEach(() => {
    api = jasmine.createSpyObj('api', ['list$', 'get$', 'delete$', 'create$', 'update$']);
    api.list$.and.returnValue(of([test as any]));
    api.get$.and.returnValue(of(test as any));
    router = jasmine.createSpyObj('router', ['navigate']);
    snack = jasmine.createSpyObj('snack', ['open']);
    params = new BehaviorSubject(convertToParamMap({}));
    TestBed.configureTestingModule({
      providers: [
        { provide: DocumentSectionsApiService, useValue: { list$: () => of([{ _id: 'ANGULAR', sectionTitle: 'Angular' }]) } },
        { provide: AssessmentTestsApiService, useValue: api },
        { provide: Router, useValue: router },
        { provide: MatSnackBar, useValue: snack },
        {
          provide: ActivatedRoute,
          useValue: { paramMap: params, parent: {} },
        },
      ],
    });
  });
  it('retains a row and never reports successful deletion when the server rejects it', () => {
    const component = TestBed.runInInjectionContext(() => new AssessmentTestListComponent());
    spyOn(window, 'confirm').and.returnValue(true);
    api.delete$.and.returnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 409,
            error: { message: 'Test has attempts' },
          })
      )
    );
    component.confirmDelete(test as any);
    expect(component.vm.tests().length).toBe(1);
    expect(component.vm.error()).toBe('Test has attempts');
    expect(snack.open).not.toHaveBeenCalled();
    expect(component.vm.loading()).toBeFalse();
  });
  it('distinguishes load failure and recovers on retry', () => {
    api.list$.and.returnValue(throwError(() => new Error('offline')));
    const component = TestBed.runInInjectionContext(() => new AssessmentTestListComponent());
    expect(component.vm.error()).toBeTruthy();
    api.list$.and.returnValue(of([test as any]));
    component.reload();
    expect(component.vm.error()).toBeNull();
    expect(component.vm.tests().length).toBe(1);
  });
  it('loads an existing section ID and refreshes its display title without changing identity', () => {
    const subject = '670000000000000000000001';
    params.next(convertToParamMap({ id: '123' }));
    api.get$.and.returnValue(of({ ...test, subject, sectionTitle: 'Old Rust title' } as any));
    spyOn(TestBed.inject(DocumentSectionsApiService), 'list$').and.returnValue(of([{ _id: subject, sectionTitle: 'Rust language' }]));
    const fixture = TestBed.createComponent(AssessmentTestWizardComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance.form.controls.subject.value).toBe(subject);
    expect(fixture.componentInstance.form.controls.sectionTitle.value).toBe('Rust language');
    api.update$.and.returnValue(of({ ...test, subject, sectionTitle: 'Rust language' } as any));
    fixture.componentInstance.submit();
    expect(api.update$.calls.mostRecent().args[0]).toEqual(jasmine.objectContaining({ subject, sectionTitle: 'Rust language', _id: '123', __v: 2 }));
  });
  it('validates skipped steps before entering review', () => {
    const component = TestBed.runInInjectionContext(() => new AssessmentTestWizardComponent());
    component.form.controls.name.setValue('Title');
    component.form.controls.subject.setValue('ANGULAR');
    component.form.controls.sectionTitle.setValue('Angular');
    component.vm.setStep(2);
    expect(component.vm.step()).toBe(1);
  });
  it('retains dirty edits after save failure and suppresses duplicate submissions', () => {
    params.next(convertToParamMap({ id: '123' }));
    const component = TestBed.runInInjectionContext(() => new AssessmentTestWizardComponent());
    component.form.controls.name.setValue('Changed');
    component.form.markAsDirty();
    const pending = new Subject<any>();
    api.update$.and.returnValue(pending);
    component.submit();
    component.submit();
    expect(api.update$).toHaveBeenCalledTimes(1);
    expect(component.canLeave()).toBeFalse();
    expect(api.update$.calls.mostRecent().args[0].__v).toBe(2);
    pending.error(new Error('offline'));
    expect(component.saving()).toBeFalse();
    expect(component.error()).toBeTruthy();
    expect(component.form.dirty).toBeTrue();
    expect(component.form.controls.name.value).toBe('Changed');
    expect(router.navigate).not.toHaveBeenCalled();
  });
  it('handles route reuse, failed loads and retry without leaving a blank editable form', () => {
    const component = TestBed.runInInjectionContext(() => new AssessmentTestWizardComponent());
    api.get$.and.returnValue(throwError(() => new Error('offline')));
    params.next(convertToParamMap({ id: '456' }));
    expect(component.loadFailed()).toBeTrue();
    component.submit();
    expect(api.update$).not.toHaveBeenCalled();
    api.get$.and.returnValue(of(test as any));
    component.retry();
    expect(component.loadFailed()).toBeFalse();
    expect(component.form.controls.name.value).toBe('Test');
    params.next(convertToParamMap({}));
    expect(component.mode()).toBe('create');
    expect(component.form.controls.name.value).toBe('');
  });
  it('opens the first invalid hidden question and returns from paginated review to the right control', () => {
    params.next(convertToParamMap({ id: '123' }));
    const component = TestBed.runInInjectionContext(() => new AssessmentTestWizardComponent());
    for (let i = 1; i < 25; i++)
      TestBed.inject(AssessmentTestFormService).addQuestion(component.form);
    const invalid = component.vm.questionControls()[1];
    component.vm.setStep(2);
    expect(component.vm.step()).toBe(1);
    expect(component.vm.requestedQuestion()).toBe(invalid);
    component.vm.editQuestion(23);
    expect(component.vm.requestedQuestion()).toBe(component.vm.questionControls()[23]);
    component.vm.reviewPage.set(2);
    expect(component.vm.reviewQuestions().length).toBe(5);
    expect(component.vm.reviewPageCount()).toBe(3);
  });
  it('asks before discarding edits and clears dirty state after a successful save', () => {
    params.next(convertToParamMap({ id: '123' }));
    const component = TestBed.runInInjectionContext(() => new AssessmentTestWizardComponent());
    component.form.markAsDirty();
    spyOn(window, 'confirm').and.returnValue(false);
    expect(component.canLeave()).toBeFalse();
    api.update$.and.returnValue(of(test as any));
    component.submit();
    expect(component.form.pristine).toBeTrue();
    expect(router.navigate).toHaveBeenCalled();
  });
  it('cancels obsolete route loads and never applies their late response to the next draft', () => {
    const obsolete = new Subject<any>();
    api.get$.and.callFake((id) =>
      id === 'old' ? obsolete : of({ ...test, _id: id, name: 'Latest' } as any)
    );
    params.next(convertToParamMap({ id: 'old' }));
    const component = TestBed.runInInjectionContext(() => new AssessmentTestWizardComponent());
    expect(component.loading()).toBeTrue();
    params.next(convertToParamMap({ id: 'new' }));
    expect(obsolete.observed).toBeFalse();
    obsolete.next({ ...test, name: 'Obsolete' });
    expect(component.form.controls.name.value).toBe('Latest');
    expect(component.loading()).toBeFalse();
    params.next(convertToParamMap({}));
    expect(component.form.controls.name.value).toBe('');
    expect(component.mode()).toBe('create');
  });

  it('cancels pending loads when the mounted wizard is destroyed and allows a fresh journey', () => {
    const pending = new Subject<any>();
    api.get$.and.returnValue(pending);
    params.next(convertToParamMap({ id: 'one' }));
    const fixture = TestBed.createComponent(AssessmentTestWizardComponent);
    fixture.detectChanges();
    expect(pending.observed).toBeTrue();
    fixture.destroy();
    expect(pending.observed).toBeFalse();
    api.get$.and.returnValue(of(test as any));
    const next = TestBed.createComponent(AssessmentTestWizardComponent);
    next.detectChanges();
    expect(next.componentInstance.loading()).toBeFalse();
    expect(next.componentInstance.form.controls.name.value).toBe('Test');
  });

  it('updates the separate heading from a rendered basics input and validates through the controls', () => {
    const fixture = TestBed.createComponent(AssessmentTestWizardComponent);
    fixture.detectChanges();
    const input: HTMLInputElement = fixture.nativeElement.querySelector(
      'input[formControlName="name"]'
    );
    input.value = 'Rendered assessment';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('h1').textContent).toContain('Rendered assessment');
    expect(
      fixture.nativeElement.querySelector('ngx-assessment-wizard-heading').textContent
    ).toContain('Unsaved changes');
    fixture.componentInstance.form.controls.subject.setValue('ANGULAR');
    fixture.componentInstance.form.controls.sectionTitle.setValue('Angular');
    const review: HTMLButtonElement = [
      ...fixture.nativeElement.querySelectorAll('nav button'),
    ].find((button: any) => button.textContent.includes('Review')) as HTMLButtonElement;
    review.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.vm.step()).toBe(1);
    expect(fixture.nativeElement.querySelector('ngx-question-fields')).not.toBeNull();
    expect(
      fixture.nativeElement.querySelectorAll('textarea[formControlName="question"]').length
    ).toBe(1);
  });
  it('renders bounded review pages and returns to the underlying selected question through child outputs', () => {
    const questions = Array.from({ length: 25 }, (_, index) => ({
      ...test.testQuestions[0],
      question: `Prompt ${index + 1}`,
    }));
    api.get$.and.returnValue(of({ ...test, testQuestions: questions } as any));
    params.next(convertToParamMap({ id: 'one' }));
    const fixture = TestBed.createComponent(AssessmentTestWizardComponent);
    fixture.detectChanges();
    const button = (label: string): HTMLButtonElement =>
      [...fixture.nativeElement.querySelectorAll('button')].find(
        (element: any) => element.textContent.trim() === label
      ) as HTMLButtonElement;
    [...fixture.nativeElement.querySelectorAll('nav button')]
      .find((element: any) => element.textContent.includes('Review'))
      .click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('details').length).toBe(10);
    expect(fixture.nativeElement.textContent).toContain('Correct feedback:');
    button('Next 10').click();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Prompt 11');
    const edit: HTMLButtonElement = [
      ...fixture.nativeElement.querySelectorAll('ngx-assessment-review button'),
    ].find((element: any) => element.textContent.includes('Edit question 11')) as HTMLButtonElement;
    edit.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.vm.step()).toBe(1);
    const prompt: HTMLTextAreaElement = fixture.nativeElement.querySelector(
      'textarea[formControlName="question"]'
    );
    expect(prompt.value).toBe('Prompt 11');
  });
});
