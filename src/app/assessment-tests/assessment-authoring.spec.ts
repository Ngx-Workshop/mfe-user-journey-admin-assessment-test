import { TestBed } from '@angular/core/testing';
import {
  ActivatedRoute,
  Router,
  convertToParamMap,
} from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BehaviorSubject, of, Subject, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { AssessmentTestsApiService } from '../services/assessment-tests-api.service';
import { AssessmentTestListComponent } from './assessment-test-list/assessment-test-list.component';
import { AssessmentTestWizardComponent } from './assessment-test-wizard.component';

const test = {
  _id: '123',
  __v: 2,
  name: 'Test',
  subject: 'ANGULAR',
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
    api = jasmine.createSpyObj('api', [
      'list$',
      'get$',
      'delete$',
      'create$',
      'update$',
    ]);
    api.list$.and.returnValue(of([test as any]));
    api.get$.and.returnValue(of(test as any));
    router = jasmine.createSpyObj('router', ['navigate']);
    snack = jasmine.createSpyObj('snack', ['open']);
    params = new BehaviorSubject(convertToParamMap({}));
    TestBed.configureTestingModule({
      providers: [
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
    const component = TestBed.runInInjectionContext(
      () => new AssessmentTestListComponent()
    );
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
    expect(component.tests().length).toBe(1);
    expect(component.error()).toBe('Test has attempts');
    expect(snack.open).not.toHaveBeenCalled();
    expect(component.loading()).toBeFalse();
  });
  it('distinguishes load failure and recovers on retry', () => {
    api.list$.and.returnValue(throwError(() => new Error('offline')));
    const component = TestBed.runInInjectionContext(
      () => new AssessmentTestListComponent()
    );
    expect(component.error()).toBeTruthy();
    api.list$.and.returnValue(of([test as any]));
    component.reload();
    expect(component.error()).toBeNull();
    expect(component.tests().length).toBe(1);
  });
  it('validates skipped steps before entering review', () => {
    const component = TestBed.runInInjectionContext(
      () => new AssessmentTestWizardComponent()
    );
    component.form.controls.name.setValue('Title');
    component.setStep(2);
    expect(component.step()).toBe(1);
  });
  it('retains dirty edits after save failure and suppresses duplicate submissions', () => {
    params.next(convertToParamMap({ id: '123' }));
    const component = TestBed.runInInjectionContext(
      () => new AssessmentTestWizardComponent()
    );
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
    const component = TestBed.runInInjectionContext(
      () => new AssessmentTestWizardComponent()
    );
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
  it('asks before discarding edits and clears dirty state after a successful save', () => {
    params.next(convertToParamMap({ id: '123' }));
    const component = TestBed.runInInjectionContext(
      () => new AssessmentTestWizardComponent()
    );
    component.form.markAsDirty();
    spyOn(window, 'confirm').and.returnValue(false);
    expect(component.canLeave()).toBeFalse();
    api.update$.and.returnValue(of(test as any));
    component.submit();
    expect(component.form.pristine).toBeTrue();
    expect(router.navigate).toHaveBeenCalled();
  });
});
