import { SectionDto } from '@tmdjr/document-contracts';
import {
  AssessmentTestDto,
  TestQuestionDto,
} from '@tmdjr/service-nestjs-assessment-test-contracts';

export type AssessmentSection = Pick<
  SectionDto,
  '_id' | 'sectionTitle'
>;

export type AssessmentSubject = AssessmentTestDto['subject'];
export type AssessmentTestPayload = {
  name: string;
  subject: AssessmentSubject;
  sectionTitle: string;
  level: number;
  testQuestions: TestQuestionDto[];
};
export type CreateAssessmentTestPayload = AssessmentTestPayload;
export type UpdateAssessmentTestPayload = AssessmentTestPayload & {
  _id: string;
  __v: number;
};
