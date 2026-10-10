import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { DocumentSectionsApiService } from '../../../../../src/app/features/assessment-tests/api/document-sections-api.service';
import { environment } from '../../../../../src/environments/environment';

describe('document sections adapter', () => {
  it('reads the document map lazily and retains section IDs and display titles', () => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    const http = TestBed.inject(HttpTestingController);
    const request$ = TestBed.inject(
      DocumentSectionsApiService
    ).list$();
    const url = `${environment.documentsApiBaseUrl}/navigation/sections`;
    http.expectNone(url);
    let result: unknown;
    request$.subscribe((sections) => (result = sections));
    const request = http.expectOne(url);
    expect(request.request.method).toBe('GET');
    request.flush({
      sections: {
        rust: {
          _id: '670000000000000000000001',
          sectionTitle: 'Rust',
        },
        angular: { _id: 'angular', sectionTitle: 'Angular' },
      },
    });
    expect(result).toEqual([
      { _id: 'angular', sectionTitle: 'Angular' },
      { _id: '670000000000000000000001', sectionTitle: 'Rust' },
    ]);
    http.verify();
  });
});
