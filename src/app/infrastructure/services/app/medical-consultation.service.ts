import { Injectable } from '@angular/core';
import { HttpService } from '../http-services/http-service.service';
import { ConfigService } from '../common/config/config.service';
import { Observable, switchMap } from 'rxjs';
import { ResponseDTO } from 'src/app/core/DTOs/common/response/response.dto';
import { MedicalConsultationDTO } from 'src/app/core/DTOs/app/medical-consultation.dto';
import { PaginatorDTO } from 'src/app/core/DTOs/common/paginator/paginator.dto';
import { IMedicalConsultationService } from 'src/app/core/interfaces/app/Imedical-consultation.service';

@Injectable({
  providedIn: "root",
})
export class MedicalConsultationService implements IMedicalConsultationService {
  constructor(
    private _httpService: HttpService,
    private _configService: ConfigService
  ) {}

  CreateMedicalConsultation(
    medicalConsultation: MedicalConsultationDTO
  ): Observable<ResponseDTO> {
    return this._configService.getUrl().pipe(
      switchMap((url) => {
        return this._httpService.post(
          url,
          "CreateMedicalConsultation",
          null,
          medicalConsultation
        );
      })
    );
  }

  UpdateMedicalConsultation(
    medicalConsultation: MedicalConsultationDTO
  ): Observable<ResponseDTO> {
    return this._configService.getUrl().pipe(
      switchMap((url) => {
        return this._httpService.put(
          url,
          "UpdateMedicalConsultation",
          null,
          medicalConsultation
        );
      })
    );
  }

  /*  GetListMedicalConsultationByIdPatient(paginator: PaginatorDTO, idPatient?: number, Status?: boolean, ConsultationDate?: string): Observable<ResponseDTO> {
    return this._configService.getUrl().pipe(
      switchMap(url => {
        let params: any = {
          PageIndex: paginator.pageIndex,
          PageSize: paginator.pageSize,
          idPatient,
          Status,
          ConsultationDate
        };
        return this._httpService.get<ResponseDTO>(url, "GetListMedicalConsultationByIdPatient", params);
      })
    );
  } */

  GetListMedicalConsultationByIdPatient(paginator: PaginatorDTO,idPatient?: number,Status?: boolean,ConsultationDate?: string): Observable<ResponseDTO> {
    return this._configService.getUrl().pipe(
      switchMap((url) => {
        // Construimos params dinámicamente
        const params: any = {
          PageIndex: paginator.pageIndex,
          PageSize: paginator.pageSize,
        };

        if (idPatient !== undefined && idPatient !== null) {
          params.idPatient = idPatient;
        }

        if (typeof Status === "boolean") {
          params.Status = Status;
        }

        if (ConsultationDate) {
          params.ConsultationDate = ConsultationDate;
        }

        return this._httpService.get<ResponseDTO>(url,"GetListMedicalConsultationByIdPatient",params);
      })
    );
  }
  

  CreateMedicalConsultationWithMedicalDiagnosis(
    medicalDiagnosis: MedicalConsultationDTO
  ): Observable<ResponseDTO> {
    return this._configService.getUrl().pipe(
      switchMap((url) => {
        return this._httpService.post(
          url,
          "CreateMedicalConsultationWithMedicalDiagnosis",
          null,
          medicalDiagnosis
        );
      })
    );
  }

  GetMedicalConsultationById(
    IdMedicalConsultation?: number
  ): Observable<ResponseDTO> {
    return this._configService.getUrl().pipe(
      switchMap((url) => {
        let params: any = {
          IdMedicalConsultation,
        };
        return this._httpService.get<ResponseDTO>(
          url,
          "GetMedicalConsultationById",
          params
        );
      })
    );
  }
}
