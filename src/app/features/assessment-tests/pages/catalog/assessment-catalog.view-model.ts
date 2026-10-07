import { computed, signal } from '@angular/core';
import { AssessmentTestDto } from '@tmdjr/service-nestjs-assessment-test-contracts';
import { AssessmentCatalogStore } from '../../state/assessment-catalog.store';

/** Local filters and derived rows; each mounted catalog gets its own view model. */
export class AssessmentCatalogViewModel {
  readonly tests;
  readonly loading;
  readonly error;
  constructor(store: AssessmentCatalogStore) {
    this.tests = store.tests;
    this.loading = store.loading;
    this.error = store.error;
  }
  readonly query = signal('');
  readonly subjectFilter = signal<
    AssessmentTestDto['subject'] | 'ALL'
  >('ALL');
  readonly levelCap = signal<number | null>(null);
  readonly sort = signal<'updated' | 'name' | 'level'>('updated');
  readonly filtered = computed(() => {
    const q = this.query().toLowerCase().trim();
    const subject = this.subjectFilter();
    const levelCap = this.levelCap();

    let rows = this.tests();

    if (subject !== 'ALL') {
      rows = rows.filter((t) => t.subject === subject);
    }

    if (levelCap !== null) {
      rows = rows.filter((t) => t.level <= levelCap);
    }

    if (q) {
      rows = rows.filter((t) => {
        const haystack = [t.name, t.subject, String(t.level)].join(
          ' '
        );
        return haystack.toLowerCase().includes(q);
      });
    }

    return this.sortRows(rows);
  });

  readonly pageIndex = signal(0);
  readonly currentPage = computed(() =>
    Math.min(
      this.pageIndex(),
      Math.max(0, Math.ceil(this.filtered().length / 10) - 1)
    )
  );
  readonly pagedTests = computed(() =>
    this.filtered().slice(
      this.currentPage() * 10,
      this.currentPage() * 10 + 10
    )
  );
  readonly levels = computed(() =>
    [...new Set(this.tests().map((test) => test.level))].sort(
      (a, b) => a - b
    )
  );
  readonly hasFilters = computed(
    () =>
      !!this.query().trim() ||
      this.subjectFilter() !== 'ALL' ||
      this.levelCap() !== null
  );

  onLevelCapChange(value: number | null) {
    this.pageIndex.set(0);
    if (value === null) {
      this.levelCap.set(null);
      return;
    }
    if (!Number.isNaN(value) && value > 0) {
      this.levelCap.set(value);
    }
  }

  clearFilters() {
    this.pageIndex.set(0);
    this.query.set('');
    this.subjectFilter.set('ALL');
    this.levelCap.set(null);
    this.sort.set('updated');
  }

  private sortRows(
    rows: readonly AssessmentTestDto[]
  ): AssessmentTestDto[] {
    const order = this.sort();

    if (order === 'name') {
      return [...rows].sort((a, b) => a.name.localeCompare(b.name));
    }

    if (order === 'level') {
      return [...rows].sort((a, b) => b.level - a.level);
    }

    return [...rows].sort(
      (a, b) =>
        new Date(b.lastUpdated).getTime() -
        new Date(a.lastUpdated).getTime()
    );
  }
}
