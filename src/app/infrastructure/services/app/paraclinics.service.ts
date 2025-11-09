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


  /* CreateParaclinics(paraclinics: ParaclinicsDTO, file?: File): Observable<ResponseDTO> {
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

        // 🔹 Nuevos campos
        if (paraclinics.idCupsCode)
          formData.append('IdCupsCode', paraclinics.idCupsCode.toString());

        if (paraclinics.idModalityAttention)
          formData.append('IdModalityAttention', paraclinics.idModalityAttention.toString());

        formData.append('IsExternal', paraclinics.isExternal ? 'true' : 'false');

        if (paraclinics.codViaIngreso)
          formData.append('CodViaIngreso', paraclinics.codViaIngreso);

        formData.append('RegisteredByUserID', paraclinics.registeredByUserID?.toString() || '0');
        formData.append('RegisteredAt', paraclinics.registeredAt || new Date().toISOString());

        if (paraclinics.updateByUserID)
          formData.append('UpdateByUserID', paraclinics.updateByUserID.toString());
        if (paraclinics.updatedAt)
          formData.append('UpdatedAt', paraclinics.updatedAt);

        if (file) {
          formData.append('File', file);
        }

        return this._httpService.post(url, 'CreateParaclinics', null, formData) as Observable<ResponseDTO>;
      })
    );
  } */

 CreateParaclinics(paraclinics: ParaclinicsDTO, file?: File): Observable<ResponseDTO> {
    return this._configService.getUrl().pipe(
      switchMap(url => {
        const formData = new FormData();

        // Campos principales
        if (paraclinics.idParaclinics)
          formData.append('IdParaclinics', paraclinics.idParaclinics.toString());

        formData.append('IdPatient', paraclinics.idPatient.toString());
        formData.append('Name', paraclinics.name);
        formData.append('DatePerformen', paraclinics.datePerformen);
        formData.append('Observations', paraclinics.observations || '');

        // 🔹 Campos existentes
        if (paraclinics.idCupsCode)
          formData.append('IdCupsCode', paraclinics.idCupsCode.toString());

        if (paraclinics.idModalityAttention)
          formData.append('IdModalityAttention', paraclinics.idModalityAttention.toString());

        formData.append('IsExternal', paraclinics.isExternal ? 'true' : 'false');

        if (paraclinics.codViaIngreso)
          formData.append('CodViaIngreso', paraclinics.codViaIngreso);

        // 🆕 Nuevos campos del endpoint
        if (paraclinics.idUser)
          formData.append('IdUser', paraclinics.idUser.toString());

        if (paraclinics.idConsultationFinality)
          formData.append('IdConsultationFinality', paraclinics.idConsultationFinality.toString());

        if (paraclinics.groupServiceCode)
          formData.append('GroupServiceCode', paraclinics.groupServiceCode);

        if (paraclinics.idCieCode)
          formData.append('IdCIECode', paraclinics.idCieCode.toString());

        // 🧑‍💻 Datos de registro y actualización
        formData.append('RegisteredByUserID', paraclinics.registeredByUserID?.toString() || '0');
        formData.append('RegisteredAt', paraclinics.registeredAt || new Date().toISOString());

        if (paraclinics.updateByUserID)
          formData.append('UpdateByUserID', paraclinics.updateByUserID.toString());

        if (paraclinics.updatedAt)
          formData.append('UpdatedAt', paraclinics.updatedAt);

        // 📎 Archivo adjunto (opcional)
        if (file)
          formData.append('File', file);

        // Llamada al endpoint
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
