import { computed, inject, Injectable, signal } from '@angular/core';
import { AssessmentTestDto } from '@tmdjr/service-nestjs-assessment-test-contracts';
import { catchError, defer, EMPTY, finalize, Observable, tap } from 'rxjs';
import { AssessmentTestsApiService } from '../services/assessment-tests-api.service';
import { apiError } from '../services/api-error';

interface CatalogState {
  tests: AssessmentTestDto[];
  loading: boolean;
  error: string | null;
}

/** Server-owned catalog state. Subscriptions belong to the calling journey. */
@Injectable({ providedIn: 'root' })
export class AssessmentCatalogStore {
  private readonly api = inject(AssessmentTestsApiService);
  private readonly state = signal<CatalogState>({
    tests: [],
    loading: false,
    error: null,
  });
  readonly tests = computed<readonly AssessmentTestDto[]>(() => this.state().tests);
  readonly loading = computed(() => this.state().loading);
  readonly error = computed(() => this.state().error);

  reload$(): Observable<AssessmentTestDto[]> {
    return defer(() => {
      if (this.loading()) return EMPTY;
      this.patch({ loading: true, error: null });
      return this.api.list$().pipe(
        tap((tests) => this.patch({ tests })),
        catchError((error) => {
          this.patch({ error: apiError(error, 'Could not load assessment tests. Please retry.') });
          return EMPTY;
        }),
        finalize(() => this.patch({ loading: false }))
      );
    });
  }

  delete$(id: string): Observable<void> {
    return defer(() => {
      if (this.loading()) return EMPTY;
      this.patch({ loading: true, error: null });
      return this.api.delete$(id).pipe(
        tap(() => this.patch({ tests: this.tests().filter((test) => test._id !== id) })),
        catchError((error) => {
          this.patch({ error: apiError(error, 'Could not delete this test. Please retry.') });
          return EMPTY;
        }),
        finalize(() => this.patch({ loading: false }))
      );
    });
  }

  private patch(update: Partial<CatalogState>) {
    this.state.update((state) => ({ ...state, ...update }));
  }
}
