import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, switchMap } from 'rxjs';
import { HttpService } from '../../http-services/http-service.service';
import { ConfigService } from '../config/config.service';
import { ResponseDTO } from 'src/app/core/DTOs/common/response/response.dto';

export interface Eps {
  nombre: string;
  codigo: string;
  codigo_movilidad: string;
  nit: string;
  regimen: string;
}

@Injectable({
  providedIn: 'root'
})
export class EpsService {

  //private epsUrl = 'assets/eps-colombia/eps-colombia.json';

  constructor(
    private _httpService: HttpService,
    private _configService: ConfigService
  ) { }

/*   getEpsList(): Observable<Eps[]> {
    return this.http.get<Eps[]>(this.epsUrl);
  }
*/

  GetEps(epsName: string): Observable<ResponseDTO> {
    return this._configService.getUrl().pipe(
      switchMap(url => {
        let params: any = {
          epsName
        };
        return this._httpService.get<ResponseDTO>(url, "GetEps", params);
      })
    );
  }

}
