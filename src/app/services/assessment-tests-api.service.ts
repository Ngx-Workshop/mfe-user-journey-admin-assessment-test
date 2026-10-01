import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { AssessmentTestDto } from '@tmdjr/service-nestjs-assessment-test-contracts';
import { Observable } from 'rxjs';
import { AssessmentTestPayload } from './assessment-test-form.service';

export type CreateAssessmentTestPayload = AssessmentTestPayload;
export type UpdateAssessmentTestPayload = AssessmentTestPayload & {
  _id: string;
  __v: number;
};

@Injectable({ providedIn: 'root' })
export class AssessmentTestsApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.assessmentTestsApiBaseUrl;

  list$(): Observable<AssessmentTestDto[]> {
    return this.http.get<AssessmentTestDto[]>(this.baseUrl);
  }

  get$(id: string): Observable<AssessmentTestDto> {
    return this.http.get<AssessmentTestDto>(`${this.baseUrl}/${id}`);
  }

  create$(
    payload: CreateAssessmentTestPayload
  ): Observable<AssessmentTestDto> {
    return this.http.post<AssessmentTestDto>(this.baseUrl, payload);
  }

  update$(
    payload: UpdateAssessmentTestPayload
  ): Observable<AssessmentTestDto> {
    return this.http.patch<AssessmentTestDto>(this.baseUrl, payload);
  }

  delete$(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
