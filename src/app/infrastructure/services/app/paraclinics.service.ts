import { Injectable } from '@angular/core';
import { HttpService } from '../http-services/http-service.service';
import { ConfigService } from '../common/config/config.service';
import { ResponseDTO } from 'src/app/core/DTOs/common/response/response.dto';
import { Observable, switchMap } from 'rxjs';
import { ParaclinicsDTO } from 'src/app/core/DTOs/app/paraclinics.dto';
import { PaginatorDTO } from 'src/app/core/DTOs/common/paginator/paginator.dto';
import { IParaclinicsService } from 'src/app/core/interfaces/app/Iparaclinics.service';

@Injectable({
  providedIn: 'root'
})
export class ParaclinicsService implements IParaclinicsService {

  constructor(
    private _httpService: HttpService,
    private _configService: ConfigService
  ) { }

CreateParaclinics(paraclinics: ParaclinicsDTO, file?: File): Observable<ResponseDTO> {
    return this._configService.getUrl().pipe(
      switchMap(url => {
        const formData = new FormData();

        if (paraclinics.idParaclinics) {
          formData.append('IdParaclinics', paraclinics.idParaclinics.toString());
        }

        formData.append('IdPatient', paraclinics.idPatient.toString());
        formData.append('Name', paraclinics.name);
        formData.append('DatePerformen', paraclinics.datePerformen);
        formData.append('Observations', paraclinics.observations || '');
        formData.append('RegisteredByUserID', paraclinics.registeredByUserID?.toString() || '0');
        formData.append('RegisteredAt', paraclinics.registeredAt || new Date().toISOString());

        if (paraclinics.updateByUserID) {
          formData.append('UpdateByUserID', paraclinics.updateByUserID.toString());
        }
        if (paraclinics.updatedAt) {
          formData.append('UpdatedAt', paraclinics.updatedAt);
        }

        if (file) {
          formData.append('File', file);
        }

        // Aquí el cambio: params = null, body = formData
        return this._httpService.post(url, 'CreateParaclinics', null, formData) as Observable<ResponseDTO>;
      })
    );
  }

  
  UpdateParaclinics(paraclinics: ParaclinicsDTO): Observable<ResponseDTO> {
    return this._configService.getUrl().pipe(
      switchMap(url => {
        // aquí sí: params = null, body = paraclinics
        return this._httpService.put(url, "UpdateParaclinics", null, paraclinics);
      })
    );
  }
 


  GetListParaclinic(paginator: PaginatorDTO, idPatient?: number): Observable<ResponseDTO> {
    return this._configService.getUrl().pipe(
      switchMap(url => {
        let params: any = {
          PageIndex: paginator.pageIndex,
          PageSize: paginator.pageSize,
          idPatient
        };
        return this._httpService.get<ResponseDTO>(url, "GetListParaclinic", params);
      })
    );
  }

}
