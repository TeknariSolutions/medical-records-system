import { Injectable } from '@angular/core';
import { HttpService } from '../http-services/http-service.service';
import { ConfigService } from '../common/config/config.service';
import { Observable, switchMap } from 'rxjs';
import { ResponseDTO } from 'src/app/core/DTOs/common/response/response.dto';
import { MedicalDiagnosisDTO } from 'src/app/core/DTOs/app/medical-diagnosis.dto';
import { IMedicalConsultationDiagnosisService } from 'src/app/core/interfaces/app/Imedical-consultation-diagnosis.service';

@Injectable({
  providedIn: 'root'
})
export class MedicalConsultationDiagnosisService implements IMedicalConsultationDiagnosisService {

  constructor(
    private _httpService: HttpService,
    private _configService: ConfigService
  ) { }


   CreateMedicalConsultationDiagnosis(medicalConsultationDiagnosis: MedicalDiagnosisDTO): Observable<ResponseDTO> {
      return this._configService.getUrl().pipe(
        switchMap(url => {
          return this._httpService.post(url, "CreateMedicalConsultationDiagnosis", null, medicalConsultationDiagnosis);
        })
      );
    }
}
