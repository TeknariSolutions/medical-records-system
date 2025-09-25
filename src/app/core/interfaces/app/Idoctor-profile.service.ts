import { Observable } from "rxjs";
import { DoctorProfileDTO } from "../../DTOs/app/doctor-profile-dto";
import { ResponseDTO } from "../../DTOs/common/response/response.dto";

export interface IDoctorProfileService {
  createDoctorProfile(doctorProfileDTO: DoctorProfileDTO): Observable<ResponseDTO>;
  updateDoctorProfile(doctorProfileDTO: DoctorProfileDTO): Observable<ResponseDTO>;
  getDoctorProfileById(doctorProfileDTO: number): Observable<ResponseDTO>;
  deleteDoctorProfile(idDoctorProfile: number): Observable<ResponseDTO>;
}