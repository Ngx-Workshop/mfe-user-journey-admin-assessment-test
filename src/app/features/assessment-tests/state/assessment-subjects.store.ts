import { computed, inject, Injectable, signal } from '@angular/core';
import { catchError, defer, EMPTY, finalize, tap } from 'rxjs';
import { DocumentSectionsApiService } from '../api/document-sections-api.service';
import { AssessmentSection } from '../models/assessment-test';

@Injectable({ providedIn: 'root' })
export class AssessmentSubjectsStore {
  private readonly api = inject(DocumentSectionsApiService);
  private readonly state = signal<{
    sections: AssessmentSection[];
    loading: boolean;
    error: string | null;
  }>({ sections: [], loading: false, error: null });
  readonly sections = computed(() => this.state().sections);
  readonly loading = computed(() => this.state().loading);
  readonly error = computed(() => this.state().error);
  reload$() {
    return defer(() => {
      if (this.loading()) return EMPTY;
      this.state.update((state) => ({
        ...state,
        loading: true,
        error: null,
      }));
      return this.api.list$().pipe(
        tap((sections) =>
          this.state.update((state) => ({ ...state, sections }))
        ),
        catchError(() => {
          this.state.update((state) => ({
            ...state,
            error: 'Could not load subjects. Please retry.',
          }));
          return EMPTY;
        }),
        finalize(() =>
          this.state.update((state) => ({ ...state, loading: false }))
        )
      );
    });
  }
}
