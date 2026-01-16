import { Injectable } from '@angular/core';
import { HttpService } from '../http-services/http-service.service';
import { ConfigService } from '../common/config/config.service';
import { Observable, switchMap } from 'rxjs';
import { ResponseDTO } from 'src/app/core/DTOs/common/response/response.dto';
import { PrescriptionDTO } from 'src/app/core/DTOs/app/prescription.dto';
import { IPrescriptionsService } from 'src/app/core/interfaces/app/Iprescriptions.service';

@Injectable({
  providedIn: 'root'
})
export class PrescriptionService implements IPrescriptionsService {

  constructor(
    private _httpService: HttpService,
    private _configService: ConfigService
  ) { }


  CreatePrescription(prescription: PrescriptionDTO): Observable<ResponseDTO> {
    return this._configService.getUrl().pipe(
      switchMap(url => {
        return this._httpService.post(url, "CreatePrescription", null, prescription);
      })
    );
  }

  GetListPrescriptions(idMedicalConsultation?: number): Observable<ResponseDTO> {
    return this._configService.getUrl().pipe(
      switchMap(url => {
        let params: any = {
          idMedicalConsultation
        };
        return this._httpService.get<ResponseDTO>(url, "GetPrescriptionsByIdMedicalConsultation", params);
      })
    );
  }

  DeletePrescriptionById(idPrescription: number): Observable<ResponseDTO> {
    return this._configService.getUrl().pipe(
      switchMap(url => {
        let params: any = {
          idPrescription
        }
        return this._httpService.delete(url, "DeletePrescriptionById", params);
      })
    );
  }

  
}
