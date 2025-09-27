import { Injectable } from "@angular/core";
import { DoctorProfileService } from "../../services/app/doctor-profile.service";
import { NotificationsService } from "../../services/common/notifications/notifications.service";
import { DoctorProfileDTO } from "src/app/core/DTOs/app/doctor-profile-dto";
import { ResponseDTO } from "src/app/core/DTOs/common/response/response.dto";
import { map } from "rxjs";

@Injectable({
    providedIn: "root",
})

export class DoctorProfileUseCase {
    constructor(private _doctorProfileService: DoctorProfileService,private _notificationService: NotificationsService) { }

    CreateDoctorProfile(doctorProfile:DoctorProfileDTO) {
        return this._doctorProfileService.createDoctorProfile(doctorProfile).pipe(map((response:ResponseDTO)=>{
            if(response.isSuccess){
                this._notificationService.showToastSuccessMessage(response.message || 'Perfil de doctor creado exitosamente');
            }else{
                this._notificationService.showToastErrorMessage(response.message || 'Ocurrió un error al crear el perfil de doctor');
            }
            return response; // retornas el objeto completo
        }))
    }
    UpdateDoctorProfile(doctorProfile:DoctorProfileDTO) {
        return this._doctorProfileService.updateDoctorProfile(doctorProfile).pipe(map((response:ResponseDTO)=>{
            if(response.isSuccess){
                this._notificationService.showToastSuccessMessage(response.message || 'Perfil de doctor actualizado exitosamente');
            }else{
                this._notificationService.showToastErrorMessage(response.message || 'Ocurrió un error al actualizar el perfil de doctor');
            }
            return response; // retornas el objeto completo
        })) 
    }
    GetDoctorProfileById(idUser:number) {
        return this._doctorProfileService.getDoctorProfileById(idUser).pipe(map((response:ResponseDTO)=>{
            if(!response.isSuccess){
                this._notificationService.showToastErrorMessage(response.message!);
                return null;
            }
            return response;
        })) 
    }
    DeleteDoctorProfile(idDoctorProfile:number) {
        return this._doctorProfileService.deleteDoctorProfile(idDoctorProfile).pipe(map((response:ResponseDTO)=>{
            if(response.isSuccess){
                this._notificationService.showToastSuccessMessage(response.message || 'Perfil de doctor eliminado exitosamente');
            }else{
                this._notificationService.showToastErrorMessage(response.message || 'Ocurrió un error al eliminar el perfil de doctor');
            }
            return response; // retornas el objeto completo
        }))
    }

}