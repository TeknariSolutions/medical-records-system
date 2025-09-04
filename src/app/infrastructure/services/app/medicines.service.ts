import { Injectable } from '@angular/core';
import { HttpService } from '../http-services/http-service.service';
import { ConfigService } from '../common/config/config.service';
import { ResponseDTO } from 'src/app/core/DTOs/common/response/response.dto';
import { Observable, switchMap } from 'rxjs';
import { MedicineDTO } from 'src/app/core/DTOs/app/medicine.dto';
import { PaginatorDTO } from 'src/app/core/DTOs/common/paginator/paginator.dto';

@Injectable({
  providedIn: 'root'
})
export class MedicinesService {

  constructor(
    private _httpService: HttpService,
    private _configService: ConfigService
  ) { }


  CreateMedicine(medicine: MedicineDTO): Observable<ResponseDTO> {
    return this._configService.getUrl().pipe(
      switchMap(url => {
        return this._httpService.post(url, "CreateMedicine", null, medicine);
      })
    );
  }

  UpdateMedicine(medicine: MedicineDTO): Observable<ResponseDTO> {
    return this._configService.getUrl().pipe(
      switchMap(url => {
        return this._httpService.put(url, "UpdateMedicine", null, medicine);
      })
    );
  }

  DeleteMedicine(idMedicine: number): Observable<ResponseDTO> {
    return this._configService.getUrl().pipe(
      switchMap(url => {
        let params: any = {
          idMedicine
        }
        return this._httpService.delete(url, "DeleteMedicine", params);
      })
    );
  }

  GetListMedicine(paginator: PaginatorDTO, idCompany?: number, ActiveIngredient?: string, CommercialName?: string): Observable<ResponseDTO> {
    return this._configService.getUrl().pipe(
      switchMap(url => {
        let params: any = {
          PageIndex: paginator.pageIndex,
          PageSize: paginator.pageSize,
          idCompany,
          ActiveIngredient,
          CommercialName
        };
        return this._httpService.get<ResponseDTO>(url, "GetListMedicine", params);
      })
    );
  }

}
