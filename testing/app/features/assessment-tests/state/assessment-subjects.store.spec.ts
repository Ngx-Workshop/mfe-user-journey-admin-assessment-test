import { TestBed } from '@angular/core/testing';
import { of, Subject, throwError } from 'rxjs';
import { DocumentSectionsApiService } from '../../../../../src/app/features/assessment-tests/api/document-sections-api.service';
import { AssessmentSubjectsStore } from '../../../../../src/app/features/assessment-tests/state/assessment-subjects.store';
import { AssessmentSection } from '../../../../../src/app/features/assessment-tests/models/assessment-test';

describe('assessment subjects state', () => {
  it('distinguishes loading, empty, errors and retry, retaining prior sections on failure', () => {
    const api = jasmine.createSpyObj<DocumentSectionsApiService>(
      'sections',
      ['list$']
    );
    const pending = new Subject<AssessmentSection[]>();
    api.list$.and.returnValue(pending);
    TestBed.configureTestingModule({
      providers: [
        { provide: DocumentSectionsApiService, useValue: api },
      ],
    });
    const store = TestBed.inject(AssessmentSubjectsStore);
    const request$ = store.reload$();
    expect(api.list$).not.toHaveBeenCalled();
    const subscription = request$.subscribe();
    expect(store.loading()).toBeTrue();
    store.reload$().subscribe();
    expect(api.list$).toHaveBeenCalledTimes(1);
    subscription.unsubscribe();
    expect(store.loading()).toBeFalse();
    api.list$.and.returnValue(
      of([{ _id: 'rust', sectionTitle: 'Rust' }])
    );
    store.reload$().subscribe();
    api.list$.and.returnValue(throwError(() => new Error('offline')));
    store.reload$().subscribe();
    expect(store.error()).toBeTruthy();
    expect(store.sections()).toEqual([
      { _id: 'rust', sectionTitle: 'Rust' },
    ]);
    api.list$.and.returnValue(of([]));
    store.reload$().subscribe();
    expect(store.error()).toBeNull();
    expect(store.sections()).toEqual([]);
  });
});
