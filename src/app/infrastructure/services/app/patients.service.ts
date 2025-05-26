import { Injectable } from '@angular/core';
import { HttpService } from '../http-services/http-service.service';
import { ConfigService } from '../common/config/config.service';
import { PatientDTO } from 'src/app/core/DTOs/app/patient.dto';
import { Observable, switchMap } from 'rxjs';
import { ResponseDTO } from 'src/app/core/DTOs/common/response/response.dto';
import { PaginatorDTO } from 'src/app/core/DTOs/common/paginator/paginator.dto';

@Injectable({
  providedIn: 'root'
})
export class PatientsService {

  constructor(
    private _httpService: HttpService,
    private _configService: ConfigService
  ) { }

  CreatePatient(patient: PatientDTO): Observable<ResponseDTO> {
    return this._configService.getUrl().pipe(
      switchMap(url => {
        return this._httpService.post(url, "CreatePatient", null, patient);
      })
    );
  }

  UpdatePatient(patient: PatientDTO): Observable<ResponseDTO> {
    return this._configService.getUrl().pipe(
      switchMap(url => {
        return this._httpService.put(url, "UpdatePatient", null, patient);
      })
    );
  }

  DeletePatient(idPatient: number): Observable<ResponseDTO> {
    return this._configService.getUrl().pipe(
      switchMap(url => {
        let params: any = {
          idPatient
        }
        return this._httpService.delete(url, "DeletePatient", params);
      })
    );
  }

   GetListPatients(paginator: PaginatorDTO, Filter?: string): Observable<ResponseDTO> {
    return this._configService.getUrl().pipe(
      switchMap(url => {
        let params: any = {
          PageIndex: paginator.pageIndex,
          PageSize: paginator.pageSize,
          Filter
        };
        return this._httpService.get<ResponseDTO>(url, "GetListPatients", params);
      })
    );
  }
}
