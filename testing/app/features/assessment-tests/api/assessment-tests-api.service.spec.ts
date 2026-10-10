import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { environment } from '../../../../../src/environments/environment';
import { AssessmentTestsApiService } from '../../../../../src/app/features/assessment-tests/api/assessment-tests-api.service';
import { AssessmentTestPayload } from '../../../../../src/app/features/assessment-tests/models/assessment-test';

const payload: AssessmentTestPayload = {
  name: 'Definition',
  subject: 'ANGULAR',
  sectionTitle: 'Angular',
  level: 1,
  testQuestions: [
    {
      question: 'Pick A',
      choices: [{ value: 'A' }, { value: 'B' }],
      answer: 'A',
      correctResponse: 'Yes',
      incorrectResponse: 'No',
    },
  ],
};

describe('stateless assessment HTTP adapter', () => {
  let api: AssessmentTestsApiService;
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    api = TestBed.inject(AssessmentTestsApiService);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());

  it('keeps reads lazy and uses collection and definition URLs', () => {
    const request$ = api.list$();
    http.expectNone(environment.assessmentTestsApiBaseUrl);
    request$.subscribe();
    const list = http.expectOne(environment.assessmentTestsApiBaseUrl);
    expect(list.request.method).toBe('GET');
    list.flush([]);
    api.get$('one').subscribe();
    const detail = http.expectOne(`${environment.assessmentTestsApiBaseUrl}/one`);
    expect(detail.request.method).toBe('GET');
    detail.flush({});
  });

  it('preserves create/update payloads, optimistic version and ID-based deletion', () => {
    api.create$(payload).subscribe();
    const create = http.expectOne(environment.assessmentTestsApiBaseUrl);
    expect(create.request.method).toBe('POST');
    expect(create.request.body).toEqual(payload);
    create.flush({});
    const updatePayload = { ...payload, _id: 'one', __v: 7 };
    api.update$(updatePayload).subscribe();
    const update = http.expectOne(environment.assessmentTestsApiBaseUrl);
    expect(update.request.method).toBe('PATCH');
    expect(update.request.body).toEqual(updatePayload);
    update.flush({});
    api.delete$('one').subscribe();
    const deletion = http.expectOne(`${environment.assessmentTestsApiBaseUrl}/one`);
    expect(deletion.request.method).toBe('DELETE');
    expect(deletion.request.body).toBeNull();
    deletion.flush(null);
  });
});
