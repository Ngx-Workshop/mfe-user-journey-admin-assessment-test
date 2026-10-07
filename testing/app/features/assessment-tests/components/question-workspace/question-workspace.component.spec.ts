import { ComponentFixture, TestBed } from '@angular/core/testing';
import { QuestionWorkspaceComponent } from '../../../../../../src/app/features/assessment-tests/components/question-workspace/question-workspace.component';
import { AssessmentTestFormService } from '../../../../../../src/app/features/assessment-tests/forms/assessment-test-form.service';

describe('large assessment question workspace', () => {
  let fixture: ComponentFixture<QuestionWorkspaceComponent>;
  let component: QuestionWorkspaceComponent;
  let forms: AssessmentTestFormService;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuestionWorkspaceComponent],
    }).compileComponents();
    forms = TestBed.inject(AssessmentTestFormService);
    fixture = TestBed.createComponent(QuestionWorkspaceComponent);
    component = fixture.componentInstance;
    const form = forms.createForm({
      name: 'Large assessment',
      subject: 'RXJS',
      level: 1,
      testQuestions: Array.from({ length: 50 }, (_, index) => ({
        question: `Prompt ${index + 1}`,
        choices: [{ value: `Answer ${index + 1}` }, { value: 'Other' }],
        answer: `Answer ${index + 1}`,
        correctResponse: `Correct ${index + 1}`,
        incorrectResponse: `Incorrect ${index + 1}`,
      })),
    });
    fixture.componentRef.setInput('form', form);
    fixture.detectChanges();
  });
  it('renders one editor and a bounded outline for 50 questions', () => {
    expect(
      fixture.nativeElement.querySelectorAll('textarea[formControlName="question"]').length
    ).toBe(1);
    expect(fixture.nativeElement.querySelectorAll('.question-outline__question-link').length).toBe(
      12
    );
    expect(component.vm.pageCount()).toBe(5);
    component.vm.page.set(4);
    fixture.detectChanges();
    expect(component.vm.visible().map((item) => item.index)).toEqual([48, 49]);
  });
  it('searches all questions and retains edits and selection across filters', () => {
    const first = component.vm.questions()[0];
    first.controls.question.setValue('Edited prompt');
    first.markAsDirty();
    component.vm.find('Prompt 49');
    fixture.detectChanges();
    expect(component.vm.matches().length).toBe(1);
    component.vm.select(component.vm.matches()[0].question, false);
    component.vm.clearFilters();
    fixture.detectChanges();
    expect(component.vm.selectedIndex()).toBe(48);
    expect(first.controls.question.value).toBe('Edited prompt');
    expect(component.form().dirty).toBeTrue();
  });
  it('updates incomplete filtering and targets a hidden invalid question', () => {
    const question = component.vm.questions()[39];
    question.controls.answer.setValue('Missing choice');
    component.vm.filterIncomplete(true);
    fixture.detectChanges();
    expect(component.vm.matches().length).toBe(1);
    expect(component.vm.completeCount()).toBe(49);
    component.vm.firstIncomplete();
    fixture.detectChanges();
    expect(component.vm.selected()).toBe(question);
    expect(question.touched).toBeTrue();
    question.controls.answer.setValue('Answer 40');
    fixture.detectChanges();
    expect(component.vm.completeCount()).toBe(50);
  });
  it('duplicates complete values into independent controls and moves the whole question', () => {
    const original = component.vm.questions()[0];
    const raw = original.getRawValue();
    component.vm.duplicate();
    fixture.detectChanges();
    const copy = component.vm.selected()!;
    expect(component.vm.questions().length).toBe(51);
    expect(copy).not.toBe(original);
    expect(copy.getRawValue()).toEqual(raw);
    copy.controls.question.setValue('Copy changed');
    expect(original.controls.question.value).toBe('Prompt 1');
    component.vm.move(1);
    fixture.detectChanges();
    expect(component.vm.selectedIndex()).toBe(2);
    const payload = forms.toPayload(component.form());
    expect(payload.testQuestions[2].question).toBe('Copy changed');
    expect(payload.testQuestions[2].answer).toBe('Answer 1');
    expect(payload.testQuestions[2].incorrectResponse).toBe('Incorrect 1');
    expect(component.form().dirty).toBeTrue();
  });
  it('moves directly across the assessment without changing answer associations', () => {
    const first = component.vm.questions()[0];
    component.vm.openMove();
    component.vm.moveTarget.set(50);
    component.vm.moveTo();
    fixture.detectChanges();
    expect(component.vm.selectedIndex()).toBe(49);
    expect(component.vm.questions()[49]).toBe(first);
    expect(forms.toPayload(component.form()).testQuestions[49].answer).toBe('Answer 1');
    component.vm.openMove();
    component.vm.moveTarget.set(1.5);
    expect(component.vm.validMove()).toBeFalse();
    component.vm.moveTarget.set(51);
    expect(component.vm.validMove()).toBeFalse();
  });
  it('restores a removed question in its original position with values intact', () => {
    const question = component.vm.questions()[24];
    const payload = forms.toPayload(component.form());
    component.vm.select(question, false);
    component.vm.remove();
    fixture.detectChanges();
    expect(component.vm.questions().length).toBe(49);
    expect(component.vm.questions()).not.toContain(question);
    component.vm.undo();
    fixture.detectChanges();
    expect(component.vm.questions()[24]).toBe(question);
    expect(component.vm.selected()).toBe(question);
    expect(forms.toPayload(component.form())).toEqual(payload);
  });
  it('selects a newly added blank question outside the current search and marks it dirty', () => {
    component.vm.find('Prompt 1');
    component.vm.add();
    fixture.detectChanges();
    expect(component.vm.selectedIndex()).toBe(50);
    expect(component.vm.selected()?.invalid).toBeTrue();
    expect(component.vm.search()).toBe('');
    expect(component.vm.currentPage()).toBe(4);
    expect(component.form().dirty).toBeTrue();
  });
  it('honors review selection and resets state when a different assessment loads', () => {
    fixture.componentRef.setInput('requestedQuestion', component.vm.questions()[44]);
    fixture.detectChanges();
    expect(component.vm.selectedIndex()).toBe(44);
    const nextForm = forms.createForm();
    fixture.componentRef.setInput('form', nextForm);
    fixture.detectChanges();
    expect(component.vm.questions().length).toBe(1);
    expect(component.vm.selected()).toBe(nextForm.controls.testQuestions.at(0));
    expect(component.vm.removed()).toBeNull();
    component.vm.remove();
    expect(component.vm.questions().length).toBe(1);
  });
});
