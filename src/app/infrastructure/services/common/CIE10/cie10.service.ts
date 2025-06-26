// cie10.service.ts
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
//import { IcdAuthService } from './auth.service';
import { Observable, of, switchMap } from 'rxjs';
import { IcdAuthService } from '../ICD-Auth/icd-auth.service';

@Injectable({ providedIn: 'root' })
export class Cie10Service {
  private baseUrl = 'https://id.who.int/icd/release/11/2023-01/mms/search';

  constructor(
    private http: HttpClient,
    private auth: IcdAuthService
  ) {}

/*   searchCodes(term: string) {
    if (!term || term.length < 3) return [];

    return this.auth.getToken().pipe(
      switchMap((token) => {
        const headers = new HttpHeaders({
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
          'API-Version': 'v2',
          'Accept-Language': 'es',
        });

        const url = `${this.baseUrl}?q=${encodeURIComponent(term)}&flatResults=true`;

        return this.http.get<any>(url, { headers });
      })
    );
  } */

  searchCodes(term: string): Observable<any> {
    if (!term || term.length < 3) {
      return of([]); // retorna Observable vacío
    }

    return this.auth.getToken().pipe(
      switchMap((token) => {
        const headers = new HttpHeaders({
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
          'API-Version': 'v2',
          'Accept-Language': 'es',
        });

        const url = `${this.baseUrl}?q=${encodeURIComponent(term)}&flatResults=true`;

        return this.http.get<any>(url, { headers });
      })
    );
  }

  
}
