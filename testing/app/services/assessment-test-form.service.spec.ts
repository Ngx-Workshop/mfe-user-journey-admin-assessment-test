import { FormBuilder } from '@angular/forms';
import { AssessmentTestFormService } from '../../../src/app/services/assessment-test-form.service';

describe('assessment authoring form', () => {
  const service = new AssessmentTestFormService(new FormBuilder());
  const question = {
    question: ' Pick A ',
    choices: [{ value: ' A ' }, { value: 'B' }],
    answer: ' A ',
    correctResponse: ' Yes ',
    incorrectResponse: ' No ',
  };
  const form = () =>
    service.createForm({
      name: ' Test ',
      subject: 'ANGULAR',
      level: 1,
      testQuestions: [
        question,
        { ...question, question: 'Second question' },
      ],
    });
  it('maps actual raw values without losing questions, answer or feedback', () => {
    const f = form();
    expect(f.valid).toBeTrue();
    const payload = service.toPayload(f);
    expect(payload.name).toBe('Test');
    expect(payload.testQuestions.length).toBe(2);
    expect(payload.testQuestions[0]).toEqual({
      question: 'Pick A',
      choices: [{ value: 'A' }, { value: 'B' }],
      answer: 'A',
      correctResponse: 'Yes',
      incorrectResponse: 'No',
    });
  });
  it('rejects fractional levels and whitespace-only fields', () => {
    const f = form();
    f.controls.level.setValue(1.5);
    expect(f.invalid).toBeTrue();
    f.controls.level.setValue(1);
    f.controls.name.setValue(' ');
    expect(f.invalid).toBeTrue();
  });
  it('requires distinct trimmed choices and re-selection after changing the answer choice', () => {
    const f = form();
    const q = f.controls.testQuestions.at(0);
    q.controls.choices.at(1).setValue('A');
    expect(q.hasError('duplicateChoices')).toBeTrue();
    q.controls.choices.at(1).setValue('B');
    q.controls.choices.at(0).setValue('C');
    expect(q.hasError('answerChoice')).toBeTrue();
    q.controls.answer.setValue('C');
    expect(f.valid).toBeTrue();
  });
  it('keeps at least one question and two choices and marks structural changes dirty', () => {
    const f = form();
    service.removeQuestion(f, 1);
    service.removeQuestion(f, 0);
    expect(f.controls.testQuestions.length).toBe(1);
    expect(f.dirty).toBeTrue();
    const q = f.controls.testQuestions.at(0);
    service.removeChoice(q, 0);
    expect(q.controls.choices.length).toBe(2);
    service.addChoice(q);
    q.controls.choices.at(2).setValue('C');
    q.controls.answer.setValue('C');
    service.removeChoice(q, 2);
    expect(q.hasError('answerChoice')).toBeTrue();
  });
});
