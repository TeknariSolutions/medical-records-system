// auth.service.ts
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class IcdAuthService {
  private tokenUrl = 'https://icdaccessmanagement.who.int/connect/token';

  constructor(private http: HttpClient) {}

  getToken(): Observable<string> {
    const body = new HttpParams()
      .set('client_id', '8e67bc1d-4155-4a8d-b8f7-723a4dfbf532_66e6f52c-16f5-41af-9875-bc9d4362063f')
      .set('client_secret', 'lqa6X5EIztwPPUryU8omzhmoUAkIRWSGzOY49tNTJg8=')
      .set('grant_type', 'client_credentials')
      .set('scope', 'icdapi_access');

    return this.http.post<any>(this.tokenUrl, body).pipe(
      map((response) => response.access_token)
    );
  }
}
