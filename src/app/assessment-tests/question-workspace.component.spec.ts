import { ComponentFixture, TestBed } from '@angular/core/testing';
import { QuestionWorkspaceComponent } from './question-workspace.component';
import { AssessmentTestFormService } from '../services/assessment-test-form.service';

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
        choices: [
          { value: `Answer ${index + 1}` },
          { value: 'Other' },
        ],
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
      fixture.nativeElement.querySelectorAll(
        'textarea[formControlName="question"]'
      ).length
    ).toBe(1);
    expect(
      fixture.nativeElement.querySelectorAll('.question-link').length
    ).toBe(12);
    expect(component.pageCount()).toBe(5);
    component.page.set(4);
    fixture.detectChanges();
    expect(component.visible().map((item) => item.index)).toEqual([
      48, 49,
    ]);
  });
  it('searches all questions and retains edits and selection across filters', () => {
    const first = component.questions()[0];
    first.controls.question.setValue('Edited prompt');
    first.markAsDirty();
    component.find('Prompt 49');
    fixture.detectChanges();
    expect(component.matches().length).toBe(1);
    component.select(component.matches()[0].question, false);
    component.clearFilters();
    fixture.detectChanges();
    expect(component.selectedIndex()).toBe(48);
    expect(first.controls.question.value).toBe('Edited prompt');
    expect(component.form().dirty).toBeTrue();
  });
  it('updates incomplete filtering and targets a hidden invalid question', () => {
    const question = component.questions()[39];
    question.controls.answer.setValue('Missing choice');
    component.filterIncomplete(true);
    fixture.detectChanges();
    expect(component.matches().length).toBe(1);
    expect(component.completeCount()).toBe(49);
    component.firstIncomplete();
    fixture.detectChanges();
    expect(component.selected()).toBe(question);
    expect(question.touched).toBeTrue();
    question.controls.answer.setValue('Answer 40');
    fixture.detectChanges();
    expect(component.completeCount()).toBe(50);
  });
  it('duplicates complete values into independent controls and moves the whole question', () => {
    const original = component.questions()[0];
    const raw = original.getRawValue();
    component.duplicate();
    fixture.detectChanges();
    const copy = component.selected()!;
    expect(component.questions().length).toBe(51);
    expect(copy).not.toBe(original);
    expect(copy.getRawValue()).toEqual(raw);
    copy.controls.question.setValue('Copy changed');
    expect(original.controls.question.value).toBe('Prompt 1');
    component.move(1);
    fixture.detectChanges();
    expect(component.selectedIndex()).toBe(2);
    const payload = forms.toPayload(component.form());
    expect(payload.testQuestions[2].question).toBe('Copy changed');
    expect(payload.testQuestions[2].answer).toBe('Answer 1');
    expect(payload.testQuestions[2].incorrectResponse).toBe(
      'Incorrect 1'
    );
    expect(component.form().dirty).toBeTrue();
  });
  it('moves directly across the assessment without changing answer associations', () => {
    const first = component.questions()[0];
    component.openMove();
    component.moveTarget.set(50);
    component.moveTo();
    fixture.detectChanges();
    expect(component.selectedIndex()).toBe(49);
    expect(component.questions()[49]).toBe(first);
    expect(
      forms.toPayload(component.form()).testQuestions[49].answer
    ).toBe('Answer 1');
    component.openMove();
    component.moveTarget.set(1.5);
    expect(component.validMove()).toBeFalse();
    component.moveTarget.set(51);
    expect(component.validMove()).toBeFalse();
  });
  it('restores a removed question in its original position with values intact', () => {
    const question = component.questions()[24];
    const payload = forms.toPayload(component.form());
    component.select(question, false);
    component.remove();
    fixture.detectChanges();
    expect(component.questions().length).toBe(49);
    expect(component.questions()).not.toContain(question);
    component.undo();
    fixture.detectChanges();
    expect(component.questions()[24]).toBe(question);
    expect(component.selected()).toBe(question);
    expect(forms.toPayload(component.form())).toEqual(payload);
  });
  it('selects a newly added blank question outside the current search and marks it dirty', () => {
    component.find('Prompt 1');
    component.add();
    fixture.detectChanges();
    expect(component.selectedIndex()).toBe(50);
    expect(component.selected()?.invalid).toBeTrue();
    expect(component.search()).toBe('');
    expect(component.currentPage()).toBe(4);
    expect(component.form().dirty).toBeTrue();
  });
  it('honors review selection and resets state when a different assessment loads', () => {
    fixture.componentRef.setInput(
      'requestedQuestion',
      component.questions()[44]
    );
    fixture.detectChanges();
    expect(component.selectedIndex()).toBe(44);
    const nextForm = forms.createForm();
    fixture.componentRef.setInput('form', nextForm);
    fixture.detectChanges();
    expect(component.questions().length).toBe(1);
    expect(component.selected()).toBe(
      nextForm.controls.testQuestions.at(0)
    );
    expect(component.removed()).toBeNull();
    component.remove();
    expect(component.questions().length).toBe(1);
  });
});
