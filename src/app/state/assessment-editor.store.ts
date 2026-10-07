import { computed, inject, Injectable, signal } from '@angular/core';
import { AssessmentTestDto } from '@tmdjr/service-nestjs-assessment-test-contracts';
import { catchError, defer, EMPTY, finalize, Observable, of, tap } from 'rxjs';
import { AssessmentTestPayload } from '../models/assessment-test';
import { AssessmentTestsApiService } from '../services/assessment-tests-api.service';
import { apiError } from '../services/api-error';

interface EditorState {
  id: string | null;
  test: AssessmentTestDto | null;
  loading: boolean;
  saving: boolean;
  loadFailed: boolean;
  error: string | null;
}

/** Request/session state only. Unsaved forms belong to the mounted wizard. */
@Injectable({ providedIn: 'root' })
export class AssessmentEditorStore {
  private readonly api = inject(AssessmentTestsApiService);
  private readonly state = signal<EditorState>({
    id: null,
    test: null,
    loading: false,
    saving: false,
    loadFailed: false,
    error: null,
  });
  readonly testId = computed(() => this.state().id);
  readonly mode = computed<'create' | 'edit'>(() => (this.testId() ? 'edit' : 'create'));
  readonly loading = computed(() => this.state().loading);
  readonly saving = computed(() => this.state().saving);
  readonly loadFailed = computed(() => this.state().loadFailed);
  readonly error = computed(() => this.state().error);

  /** switchMap in the orchestrator cancels an obsolete session before opening another. */
  open$(id: string | null): Observable<AssessmentTestDto | null> {
    return defer(() => {
      this.patch({ id, test: null, error: null, loadFailed: false, loading: !!id });
      if (!id) return of(null);
      return this.api.get$(id).pipe(
        tap((test) => this.patch({ test })),
        catchError((error) => {
          this.patch({
            loadFailed: true,
            error: apiError(error, 'Could not load this test. Please retry.'),
          });
          return EMPTY;
        }),
        finalize(() => this.patch({ loading: false }))
      );
    });
  }

  save$(payload: AssessmentTestPayload): Observable<AssessmentTestDto> {
    return defer(() => {
      if (this.saving() || this.loading() || this.loadFailed()) return EMPTY;
      const { id, test } = this.state();
      if (id && !test) return EMPTY;
      this.patch({ saving: true, error: null });
      const request$ =
        id && test
          ? this.api.update$({ ...payload, _id: id, __v: test.__v })
          : this.api.create$(payload);
      return request$.pipe(
        // Clear pending before success reaches navigation and the unsaved guard.
        tap((test) => this.patch({ test, saving: false })),
        catchError((error) => {
          this.patch({
            error: apiError(
              error,
              'Could not save this test. Your changes are still here. Please retry.'
            ),
          });
          return EMPTY;
        }),
        finalize(() => this.patch({ saving: false }))
      );
    });
  }

  private patch(update: Partial<EditorState>) {
    this.state.update((state) => ({ ...state, ...update }));
  }
}
