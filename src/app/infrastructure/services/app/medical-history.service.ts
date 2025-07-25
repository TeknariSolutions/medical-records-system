import { IMedicalHistoryService } from './../../../core/interfaces/app/Imedical-history.service';
import { Injectable } from '@angular/core';
import { HttpService } from '../http-services/http-service.service';
import { ConfigService } from '../common/config/config.service';
import { MedicalHistoryDTO } from 'src/app/core/DTOs/app/medical-history.dto';
import { Observable, switchMap } from 'rxjs';
import { ResponseDTO } from 'src/app/core/DTOs/common/response/response.dto';
import { PaginatorDTO } from 'src/app/core/DTOs/common/paginator/paginator.dto';

@Injectable({
  providedIn: 'root'
})
export class MedicalHistoryService implements IMedicalHistoryService {

  constructor(
    private _httpService: HttpService,
    private _configService: ConfigService
  ) { }


  CreateMedicalHistory(medicalHistory: MedicalHistoryDTO): Observable<ResponseDTO> {
    return this._configService.getUrl().pipe(
      switchMap(url => {
        return this._httpService.post(url, "CreateMedicalHistory", null, medicalHistory);
      })
    );
  }

  UpdateMedicalHistory(medicalHistory: MedicalHistoryDTO): Observable<ResponseDTO> {
    return this._configService.getUrl().pipe(
      switchMap(url => {
        return this._httpService.put(url, "UpdateMedicalHistory", null, medicalHistory);
      })
    );
  }


  GetListMedicalHistoryPatient(paginator: PaginatorDTO, idPatient?: number): Observable<ResponseDTO> {
    return this._configService.getUrl().pipe(
      switchMap(url => {
        let params: any = {
          PageIndex: paginator.pageIndex,
          PageSize: paginator.pageSize,
          idPatient
        };
        return this._httpService.get<ResponseDTO>(url, "GetListMedicalHistoryPatient", params);
      })
    );
  }


  GetLastMedicalHistory(idPatient?: number): Observable<ResponseDTO> {
    return this._configService.getUrl().pipe(
      switchMap(url => {
        let params: any = {
          idPatient
        };
        return this._httpService.get<ResponseDTO>(url, "GetLastMedicalHistory", params);
      })
    );
  }
}
