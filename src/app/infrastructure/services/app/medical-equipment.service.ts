import { Injectable } from '@angular/core';
import { HttpService } from '../http-services/http-service.service';
import { ConfigService } from '../common/config/config.service';
import { MedicalEquipmentDTO } from 'src/app/core/DTOs/app/medical-equipment.dto';
import { Observable, switchMap } from 'rxjs';
import { ResponseDTO } from 'src/app/core/DTOs/common/response/response.dto';
import { PaginatorDTO } from 'src/app/core/DTOs/common/paginator/paginator.dto';

@Injectable({
  providedIn: 'root'
})
export class MedicalEquipmentService {

  constructor(
    private _httpService: HttpService,
    private _configService: ConfigService
  ) { }


  CreateMedicalEquipment(equipment: MedicalEquipmentDTO): Observable<ResponseDTO> {
    return this._configService.getUrl().pipe(
      switchMap(url => {
        return this._httpService.post(url, "CreateMedicalEquipment", null, equipment);
      })
    );
  }

  UpdateMedicalEquipment(equipment: MedicalEquipmentDTO): Observable<ResponseDTO> {
    return this._configService.getUrl().pipe(
      switchMap(url => {
        return this._httpService.put(url, "UpdateMedicalEquipment", null, equipment);
      })
    );
  }

  GetListMedicalEquipment(paginator: PaginatorDTO): Observable<ResponseDTO> {
    return this._configService.getUrl().pipe(
      switchMap(url => {
        let params: any = {
          PageIndex: paginator.pageIndex,
          PageSize: paginator.pageSize,
        };
        return this._httpService.get<ResponseDTO>(url, "GetListMedicalEquipment", params);
      })
    );
  }
}
