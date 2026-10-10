import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatSelectHarness } from '@angular/material/select/testing';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { MatSelect } from '@angular/material/select';
import { AssessmentBasicsComponent } from '../../../../../../src/app/features/assessment-tests/pages/wizard/assessment-basics.component';
import { AssessmentTestFormService } from '../../../../../../src/app/features/assessment-tests/forms/assessment-test-form.service';

describe('dynamic assessment subject selection', () => {
  it('renders server titles, saves the selected ID/title and retains selection after object replacement', async () => {
    const fixture = TestBed.createComponent(
      AssessmentBasicsComponent
    );
    const forms = TestBed.inject(AssessmentTestFormService);
    const form = forms.createForm();
    fixture.componentRef.setInput('form', form);
    fixture.componentRef.setInput('subjects', [
      { _id: 'rust-id', sectionTitle: 'Rust' },
    ]);
    fixture.detectChanges();
    expect(form.controls.subject.value).toBe('');
    expect(form.controls.subject.invalid).toBeTrue();
    const select = fixture.debugElement.query(By.directive(MatSelect))
      .componentInstance as MatSelect;
    expect(select.options.map((option) => option.viewValue)).toEqual([
      'Rust',
    ]);
    const harness =
      await TestbedHarnessEnvironment.loader(fixture).getHarness(
        MatSelectHarness
      );
    await harness.clickOptions({ text: 'Rust' });
    const payload = forms.toPayload(form);
    expect(payload.subject).toBe('rust-id');
    expect(payload.sectionTitle).toBe('Rust');
    fixture.componentRef.setInput('subjects', [
      { _id: 'rust-id', sectionTitle: 'Rust language' },
    ]);
    fixture.detectChanges();
    expect(select.value).toBe('rust-id');
    expect(select.triggerValue).toBe('Rust language');
  });

  it('shows recoverable load states and retains an existing subject absent from current sections', async () => {
    const fixture = TestBed.createComponent(
      AssessmentBasicsComponent
    );
    const form = TestBed.inject(AssessmentTestFormService).createForm(
      { subject: 'LEGACY', sectionTitle: 'Existing subject' }
    );
    fixture.componentRef.setInput('form', form);
    fixture.componentRef.setInput('loading', true);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain(
      'Loading subjects'
    );
    fixture.componentRef.setInput('loading', false);
    fixture.componentRef.setInput(
      'error',
      'Could not load subjects. Please retry.'
    );
    const retry = jasmine.createSpy();
    fixture.componentInstance.retry.subscribe(retry);
    fixture.detectChanges();
    fixture.nativeElement.querySelector('button').click();
    expect(retry).toHaveBeenCalled();
    expect(form.controls.subject.value).toBe('LEGACY');
    fixture.componentRef.setInput('error', null);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain(
      'No sections are available'
    );
    await fixture.whenStable();
    fixture.detectChanges();
    const select = fixture.debugElement.query(By.directive(MatSelect))
      .componentInstance as MatSelect;
    expect(select.triggerValue).toBe(
      'Existing subject (existing subject)'
    );
  });
});
