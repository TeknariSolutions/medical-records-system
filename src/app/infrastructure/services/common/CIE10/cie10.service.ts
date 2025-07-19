// cie10.service.ts
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable, of, switchMap } from 'rxjs';
import { IcdAuthService } from '../ICD-Auth/icd-auth.service';
//import { IcdBackendAuthService } from './icd-backend-auth.service';  // Nuevo servicio

@Injectable({ providedIn: 'root' })
export class Cie10Service {
  private baseUrl = 'https://id.who.int/icd/release/11/2023-01/mms/search';

  constructor(
    private http: HttpClient,
    private backendAuth: IcdAuthService
  ) {}

  searchCodes(term: string): Observable<any[]> {
    if (!term || term.length < 3) {
      return of([]);  // Si no hay término, devuelve lista vacía
    }

    return this.backendAuth.getToken().pipe(
      switchMap((token) => {
        const headers = new HttpHeaders({
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
          'API-Version': 'v2',
          'Accept-Language': 'es',
        });

        const url = `${this.baseUrl}?q=${encodeURIComponent(term)}&flatResults=true`;

        return this.http.get<any>(url, { headers }).pipe(
          // Mapea el resultado para devolver solo lo que te interesa
          map(response => response.destinationEntities || [])
        );
      })
    );
  }
}
