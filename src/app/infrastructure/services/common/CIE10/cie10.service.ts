// cie10.service.ts
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable, of, switchMap } from 'rxjs';
import { IcdAuthService } from '../ICD-Auth/icd-auth.service';
import { PaginatorDTO } from 'src/app/core/DTOs/common/paginator/paginator.dto';
import { HttpService } from '../../http-services/http-service.service';
import { ConfigService } from '../config/config.service';
import { ResponseDTO } from 'src/app/core/DTOs/common/response/response.dto';
//import { IcdBackendAuthService } from './icd-backend-auth.service';  // Nuevo servicio

@Injectable({ providedIn: 'root' })

export class Cie10Service {
  private baseUrl = 'https://id.who.int/icd/release/11/2023-01/mms/search';

  constructor(
    private http: HttpClient,
    private backendAuth: IcdAuthService,
    private _httpService: HttpService,
    private _configService: ConfigService
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


  GetListCIECodes(paginator: PaginatorDTO, description?: string, code?: string, name?: string): Observable<ResponseDTO> {
    return this._configService.getUrl().pipe(
      switchMap(url => {
        let params: any = {
          PageIndex: paginator.pageIndex ?? 0,
          PageSize: paginator.pageSize ?? 10,
          description: description || "",
          code: code || "",
          name: name || ""
        };
        return this._httpService.get<ResponseDTO>(url, "api/CIE10Codes/GetListCIECodes", params);
      })
    );
  }

}
