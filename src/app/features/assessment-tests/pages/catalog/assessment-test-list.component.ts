import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  MatSnackBar,
  MatSnackBarModule,
} from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { AssessmentTestDto } from '@tmdjr/service-nestjs-assessment-test-contracts';
import { AssessmentCatalogStore } from '../../state/assessment-catalog.store';
import { AssessmentCatalogViewModel } from './assessment-catalog.view-model';
import { AssessmentCatalogViewComponent } from './assessment-catalog-view.component';

@Component({
  selector: 'ngx-assessment-test-list',
  imports: [AssessmentCatalogViewComponent, MatSnackBarModule],
  template: `
    <ngx-assessment-catalog-view
      [vm]="vm"
      (queryChange)="vm.query.set($event); vm.pageIndex.set(0)"
      (subjectChange)="
        vm.subjectFilter.set($event); vm.pageIndex.set(0)
      "
      (levelChange)="vm.onLevelCapChange($event)"
      (sortChange)="vm.sort.set($event); vm.pageIndex.set(0)"
      (pageChange)="vm.pageIndex.set($event)"
      (clear)="vm.clearFilters()"
      (refresh)="reload()"
      (create)="openCreate()"
      (edit)="openEdit($event)"
      (delete)="confirmDelete($event)"
    />
  `,
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssessmentTestListComponent {
  private readonly store = inject(AssessmentCatalogStore);
  private readonly snack = inject(MatSnackBar);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  readonly vm = new AssessmentCatalogViewModel(this.store);

  constructor() {
    this.reload();
  }

  reload() {
    this.store
      .reload$()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();
  }

  openCreate() {
    this.router.navigate(['tests', 'new'], {
      relativeTo: this.route,
    });
  }

  openEdit(test: AssessmentTestDto) {
    this.router.navigate(['tests', test._id], {
      relativeTo: this.route,
    });
  }

  confirmDelete(test: AssessmentTestDto) {
    if (this.store.loading() || !confirm(`Delete "${test.name}"?`))
      return;
    this.store
      .delete$(test._id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() =>
        this.snack.open('Test deleted', undefined, { duration: 2000 })
      );
  }
}
