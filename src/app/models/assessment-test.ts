import {
  AssessmentTestDto,
  TestQuestionDto,
} from '@tmdjr/service-nestjs-assessment-test-contracts';

export type AssessmentSubject = AssessmentTestDto['subject'];
export type AssessmentTestPayload = {
  name: string;
  subject: AssessmentSubject;
  level: number;
  testQuestions: TestQuestionDto[];
};
export type CreateAssessmentTestPayload = AssessmentTestPayload;
export type UpdateAssessmentTestPayload = AssessmentTestPayload & {
  _id: string;
  __v: number;
};
