import { Injectable } from '@angular/core';
import { HttpService } from '../../http-services/http-service.service';
import { ConfigService } from '../config/config.service';
import { ResponseDTO } from 'src/app/core/DTOs/common/response/response.dto';
import { map, Observable, switchMap } from 'rxjs';
import { PaginatorDTO } from 'src/app/core/DTOs/common/paginator/paginator.dto';
import { TableResultDTO } from 'src/app/core/DTOs/common/table-result/table-result.dto';

@Injectable({
  providedIn: 'root'
})
export class CUPSCodeService {

  constructor(
    private _httpService: HttpService,
    private _configService: ConfigService
  ) { }


  GetListCUPS_Codes(paginator: PaginatorDTO, code?: string, name?: string): Observable<ResponseDTO> {
    return this._configService.getUrl().pipe(
      switchMap(url => {
        let params: any = {
          PageIndex: paginator.pageIndex,
          PageSize: paginator.pageSize,
          code,
          name
        };
        return this._httpService.get<ResponseDTO>(url, "GetListCUPS_Codes", params);
      })
    );
  }


  GetCUPSCodeById(idCUPSCode: number): Observable<ResponseDTO> {
    return this._configService.getUrl().pipe(
      switchMap(url => {
        let params: any = {
          idCUPSCode
        };
        return this._httpService.get<ResponseDTO>(url, "GetCUPSCodeById", params);
      })
    );
  }

  
  GetCupsConsultationneumology(): Observable<ResponseDTO> {
    return this._configService.getUrl().pipe(
      switchMap(url => {

        return this._httpService.get<ResponseDTO>(url, "GetCupsConsultationneumology");
      })
    );
  }

}
