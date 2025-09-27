import { Injectable } from '@angular/core';
import { HttpService } from '../http-services/http-service.service';
import { IDoctorProfileService } from 'src/app/core/interfaces/app/Idoctor-profile.service';
import { Observable, switchMap } from 'rxjs';
import { DoctorProfileDTO } from 'src/app/core/DTOs/app/doctor-profile-dto';
import { ResponseDTO } from 'src/app/core/DTOs/common/response/response.dto';
import { ConfigService } from '../common/config/config.service';

@Injectable({
  providedIn: 'root'
})
export class DoctorProfileService implements IDoctorProfileService {

  constructor(
    private _httpService: HttpService,
    private _configService: ConfigService
  ) { }
  createDoctorProfile(doctorProfileDTO: DoctorProfileDTO): Observable<ResponseDTO> {
    return this._configService.getUrl().pipe(
      switchMap(url => {
        return this._httpService.post(url, "CreateDoctorProfile", null, doctorProfileDTO);
      })
    );
  }
  updateDoctorProfile(doctorProfileDTO: DoctorProfileDTO): Observable<ResponseDTO> {
    return this._configService.getUrl().pipe(
      switchMap(url => {
        return this._httpService.put(url, "UpdateDoctorProfile", null, doctorProfileDTO);
      })
    );
  }
  getDoctorProfileById(idUser: number): Observable<ResponseDTO> {
    return this._configService.getUrl().pipe(
      switchMap(url => {
        let params :any={
          idUser
        }
        return this._httpService.get<ResponseDTO>(url, "GetDoctorProfileByIdUser", params);
      })
    );
  }
  deleteDoctorProfile(idDoctorProfile: number): Observable<ResponseDTO> {
    return this._configService.getUrl().pipe(
      switchMap(url => {
         let params :any={
          idDoctorProfile
        }
        return this._httpService.delete(url, "DeleteDoctorProfile",  params);
      })
    );
  }
}
