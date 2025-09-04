import { Injectable } from '@angular/core';
import { HttpService } from '../http-services/http-service.service';
import { ConfigService } from '../common/config/config.service';
import { Observable, switchMap } from 'rxjs';
import { ResponseDTO } from 'src/app/core/DTOs/common/response/response.dto';
import { PrescriptionDetailDTO } from 'src/app/core/DTOs/app/prescription-details.dto';
import { IPrescriptionDetailsService } from 'src/app/core/interfaces/app/Iprescription-details.service';

@Injectable({
  providedIn: 'root'
})
export class PrescriptionDetailsService implements IPrescriptionDetailsService {

   constructor(
      private _httpService: HttpService,
      private _configService: ConfigService
    ) { }

    
  CreatePrescriptionDetails(prescriptionDetail: PrescriptionDetailDTO): Observable<ResponseDTO> {
    return this._configService.getUrl().pipe(
      switchMap(url => {
        return this._httpService.post(url, "CreatePrescriptionDetails", null, prescriptionDetail);
      })
    );
  }

  UpdatePrescriptionDetails(prescriptionDetail: PrescriptionDetailDTO): Observable<ResponseDTO> {
    return this._configService.getUrl().pipe(
      switchMap(url => {
        return this._httpService.put(url, "UpdatePrescriptionDetails", null, prescriptionDetail);
      })
    );
  }

  GetPrescriptionDetailsByIdPrescription(idPrescription?: number): Observable<ResponseDTO> {
    return this._configService.getUrl().pipe(
      switchMap(url => {
        let params: any = {
          idPrescription
        };
        return this._httpService.get<ResponseDTO>(url, "GetPrescriptionDetailsByIdPrescription", params);
      })
    );
  }
}
