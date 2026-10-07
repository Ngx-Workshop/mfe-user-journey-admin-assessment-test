import { TestBed } from '@angular/core/testing';
import { of, Subject, throwError } from 'rxjs';
import { AssessmentTestDto } from '@tmdjr/service-nestjs-assessment-test-contracts';
import { AssessmentTestFormService } from '../../../src/app/services/assessment-test-form.service';
import { AssessmentTestsApiService } from '../../../src/app/services/assessment-tests-api.service';
import { AssessmentCatalogStore } from '../../../src/app/state/assessment-catalog.store';
import { AssessmentEditorStore } from '../../../src/app/state/assessment-editor.store';
import { AssessmentCatalogViewModel } from '../../../src/app/assessment-tests/catalog/assessment-catalog.view-model';

const test: AssessmentTestDto = {
  _id: 'one',
  __v: 3,
  name: 'Assessment',
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

describe('singleton assessment stores', () => {
  let api: jasmine.SpyObj<AssessmentTestsApiService>;
  beforeEach(() => {
    api = jasmine.createSpyObj('api', ['list$', 'get$', 'create$', 'update$', 'delete$']);
    api.list$.and.returnValue(of([test]));
    api.get$.and.returnValue(of(test));
    TestBed.configureTestingModule({
      providers: [{ provide: AssessmentTestsApiService, useValue: api }],
    });
  });

  it('shares catalog data while keeping each journey’s filters independent', () => {
    const store = TestBed.inject(AssessmentCatalogStore);
    const first = new AssessmentCatalogViewModel(store);
    const second = new AssessmentCatalogViewModel(TestBed.inject(AssessmentCatalogStore));
    first.query.set('missing');
    store.reload$().subscribe();
    expect(first.filtered()).toEqual([]);
    expect(second.filtered()).toEqual([test]);
    expect(second.query()).toBe('');
  });

  it('starts requests lazily, suppresses concurrent operations, and releases cancelled loading', () => {
    const pending = new Subject<AssessmentTestDto[]>();
    api.list$.and.returnValue(pending);
    const store = TestBed.inject(AssessmentCatalogStore);
    const request$ = store.reload$();
    expect(api.list$).not.toHaveBeenCalled();
    const subscription = request$.subscribe();
    store.reload$().subscribe();
    store.delete$('one').subscribe();
    expect(api.list$).toHaveBeenCalledTimes(1);
    expect(api.delete$).not.toHaveBeenCalled();
    subscription.unsubscribe();
    expect(store.loading()).toBeFalse();
    api.list$.and.returnValue(of([test]));
    store.reload$().subscribe();
    expect(store.tests()).toEqual([test]);
  });

  it('retains the previous catalog on refresh failure and removes rows only after successful deletion', () => {
    const store = TestBed.inject(AssessmentCatalogStore);
    store.reload$().subscribe();
    api.list$.and.returnValue(throwError(() => new Error('offline')));
    store.reload$().subscribe();
    expect(store.tests()).toEqual([test]);
    expect(store.error()).toBeTruthy();
    const pending = new Subject<void>();
    api.delete$.and.returnValue(pending);
    const success = jasmine.createSpy();
    store.delete$('one').subscribe(success);
    store.delete$('one').subscribe(success);
    expect(api.delete$).toHaveBeenCalledTimes(1);
    expect(store.tests()).toEqual([test]);
    pending.next();
    pending.complete();
    expect(store.tests()).toEqual([]);
    expect(store.error()).toBeNull();
    expect(success).toHaveBeenCalledTimes(1);
    expect(store.loading()).toBeFalse();
  });

  it('blocks saving after failed load and clears stale edit identity when opening create', () => {
    const store = TestBed.inject(AssessmentEditorStore);
    const forms = TestBed.inject(AssessmentTestFormService);
    const payload = forms.toPayload(forms.createForm(test));
    api.get$.and.returnValue(throwError(() => new Error('missing')));
    store.open$('missing').subscribe();
    store.save$(payload).subscribe();
    expect(api.update$).not.toHaveBeenCalled();
    api.create$.and.returnValue(of(test));
    store.open$(null).subscribe();
    store.save$(payload).subscribe();
    expect(store.testId()).toBeNull();
    expect(store.mode()).toBe('create');
    expect(store.error()).toBeNull();
    expect(store.loadFailed()).toBeFalse();
    expect(api.create$).toHaveBeenCalledWith(payload);
  });

  it('releases cancelled saves and uses the latest server version on a subsequent update', () => {
    const store = TestBed.inject(AssessmentEditorStore);
    const forms = TestBed.inject(AssessmentTestFormService);
    const payload = forms.toPayload(forms.createForm(test));
    store.open$('one').subscribe();
    api.update$.and.returnValue(new Subject<AssessmentTestDto>());
    const pending = store.save$(payload).subscribe();
    store.save$(payload).subscribe();
    expect(api.update$).toHaveBeenCalledTimes(1);
    pending.unsubscribe();
    expect(store.saving()).toBeFalse();
    api.update$.and.returnValue(of({ ...test, __v: 4 }));
    store.save$(payload).subscribe();
    store.save$(payload).subscribe();
    expect(api.update$.calls.mostRecent().args[0]).toEqual({ ...payload, _id: 'one', __v: 4 });
  });
});
