import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of } from 'rxjs';
import { AssessmentTestsApiService } from '../../services/assessment-tests-api.service';
import { AssessmentTestListComponent } from './assessment-test-list.component';
import { AssessmentTestListAccordionComponent } from './assessment-test-list-accordion.component';
import { AssessmentTestDto } from '@tmdjr/service-nestjs-assessment-test-contracts';

const rows = Array.from({ length: 25 }, (_, i) => ({
  _id: String(i), __v: 0, name: `Assessment ${String(i).padStart(2, '0')}`,
  subject: i % 2 ? 'ANGULAR' : 'RXJS', level: i + 1,
  lastUpdated: '2026-10-01T00:00:00Z',
  testQuestions: Array.from({ length: 50 }, (_, q) => ({ question: `Question ${q}`, choices: [], answer: '', correctResponse: '', incorrectResponse: '' })),
} as AssessmentTestDto));

describe('assessment catalog', () => {
  beforeEach(() => TestBed.configureTestingModule({ providers: [
    { provide: AssessmentTestsApiService, useValue: { list$: () => of(rows) } },
    { provide: Router, useValue: { navigate: jasmine.createSpy() } },
    { provide: ActivatedRoute, useValue: {} },
    { provide: MatSnackBar, useValue: { open: jasmine.createSpy() } },
  ] }));
  it('bounds rows and clamps the final page after refreshed data shrinks', () => {
    const component = TestBed.runInInjectionContext(() => new AssessmentTestListComponent());
    expect(component.pagedTests().length).toBe(10);
    component.pageIndex.set(2);
    expect(component.pagedTests().length).toBe(5);
    component.tests.set(rows.slice(0, 11));
    expect(component.currentPage()).toBe(1);
    expect(component.pagedTests().length).toBe(1);
  });
  it('combines filters, resets pages and recovers from zero results', () => {
    const fixture = TestBed.createComponent(AssessmentTestListComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;
    component.pageIndex.set(2);
    const search: HTMLInputElement = fixture.nativeElement.querySelector('input');
    search.value = 'Assessment 0';
    search.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(component.pageIndex()).toBe(0);
    component.subjectFilter.set('ANGULAR');
    component.onLevelCapChange(5);
    expect(component.filtered().map(row => row._id)).toEqual(['1', '3']);
    component.query.set('missing');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('No matching assessments');
    component.clearFilters();
    expect(component.filtered().length).toBe(25);
  });
  it('renders bounded question previews and emits the correct edit target', () => {
    const fixture = TestBed.createComponent(AssessmentTestListAccordionComponent);
    fixture.componentRef.setInput('tests', rows.slice(0, 2));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('ol li').length).toBe(6);
    expect(fixture.nativeElement.textContent).toContain('50 questions');
    const edit = jasmine.createSpy();
    fixture.componentInstance.edit.subscribe(edit);
    fixture.nativeElement.querySelector('[aria-label="Edit Assessment 01"]').click();
    expect(edit).toHaveBeenCalledWith(rows[1]);
  });
});
