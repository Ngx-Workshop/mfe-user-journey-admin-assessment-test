import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { SectionsMapDto } from '@tmdjr/document-contracts';
import { map } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class DocumentSectionsApiService {
  private readonly http = inject(HttpClient);
  list$() {
    return this.http
      .get<SectionsMapDto>(
        `${environment.documentsApiBaseUrl}/navigation/sections`
      )
      .pipe(
        map(({ sections }) =>
          Object.values(sections)
            .map(({ _id, sectionTitle }) => ({ _id, sectionTitle }))
            .sort((a, b) =>
              a.sectionTitle.localeCompare(b.sectionTitle)
            )
        )
      );
  }
}
