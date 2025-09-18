import { Injectable } from '@angular/core';
import { HttpService } from '../http-services/http-service.service';
import { ConfigService } from '../common/config/config.service';
import { ResponseDTO } from 'src/app/core/DTOs/common/response/response.dto';
import { Observable, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CloseConsultationService {

  constructor(
    private _httpService: HttpService,
    private _configService: ConfigService
  ) { }


  GetExitConditions(): Observable<ResponseDTO> {
    return this._configService.getUrl().pipe(
      switchMap(url => {
        return this._httpService.get<ResponseDTO>(url, "GetExitConditions");
      })
    );
  }


  GetExternalCauseCodes(): Observable<ResponseDTO> {
    return this._configService.getUrl().pipe(
      switchMap(url => {
        return this._httpService.get<ResponseDTO>(url, "GetExternalCauseCodes");
      })
    );
  }

  GetConsultationFinalities(): Observable<ResponseDTO> {
    return this._configService.getUrl().pipe(
      switchMap(url => {
        return this._httpService.get<ResponseDTO>(url, "GetConsultationFinalities");
      })
    );
  }

}
