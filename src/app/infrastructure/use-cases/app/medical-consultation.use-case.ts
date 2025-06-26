import { Injectable } from "@angular/core";
import { map, Observable, of } from "rxjs";
import { NotificationsService } from "../../services/common/notifications/notifications.service";
import { ResponseDTO } from "src/app/core/DTOs/common/response/response.dto";
import { PaginatorDTO } from "src/app/core/DTOs/common/paginator/paginator.dto";
import { TableResultDTO } from "src/app/core/DTOs/common/table-result/table-result.dto";
import { MedicalConsultationService } from "../../services/app/medical-consultation.service";
import { MedicalConsultationDTO } from "src/app/core/DTOs/app/medical-consultation.dto";

@Injectable({
    providedIn: "root",
})

export class MedicalConsultationUseCase {
    constructor(private _medicalConsultationService: MedicalConsultationService,
        private _notificationService: NotificationsService
    ) { }

    /* CreateMedicalConsultation(medicalConsultation: MedicalConsultationDTO): Observable<boolean> {
        return this._medicalConsultationService.CreateMedicalConsultation(medicalConsultation).pipe(
            map((response: ResponseDTO) => {
                if (!response.isSuccess) {
                    this._notificationService.showToastErrorMessage(response.message!);
                } else {
                    this._notificationService.showToastSuccessMessage(response.message!);
                }
                return response.data;
            })
        );
    } */

    CreateMedicalConsultation(medicalConsultation: MedicalConsultationDTO): Observable<ResponseDTO> {
        return this._medicalConsultationService.CreateMedicalConsultation(medicalConsultation).pipe(
            map((response: ResponseDTO) => {
                if (response.isSuccess) {
                    this._notificationService.showToastSuccessMessage(response.message || 'Consulta creada exitosamente');
                } else {
                    this._notificationService.showToastErrorMessage(response.message || 'Ocurrió un error al crear la consulta');
                }
                return response; // retornas el objeto completo
            })
        );
    }

    /* UpdateMedicalConsultation(medicalConsultation: MedicalConsultationDTO): Observable<boolean> {
        return this._medicalConsultationService.UpdateMedicalConsultation(medicalConsultation).pipe(
            map((response: ResponseDTO) => {
                if (!response.isSuccess) {
                    this._notificationService.showToastErrorMessage(response.message!);
                } else {
                    this._notificationService.showToastSuccessMessage(response.message!);
                }
                return response.data;
            })
        );
    } */

    UpdateMedicalConsultation(medicalConsultation: MedicalConsultationDTO): Observable<ResponseDTO> {
        return this._medicalConsultationService.UpdateMedicalConsultation(medicalConsultation).pipe(
            map((response: ResponseDTO) => {
                if (response.isSuccess) {
                    this._notificationService.showToastSuccessMessage(response.message || 'Consulta actualizada exitosamente');
                } else {
                    this._notificationService.showToastErrorMessage(response.message || 'Ocurrió un error al actualizar la consulta');
                }

                return response; // retornas el objeto completo
            })
        );
    }

    GetListMedicalConsultationByIdPatient(paginator: PaginatorDTO, idPatient?: number): Observable<TableResultDTO> {
        return this._medicalConsultationService.GetListMedicalConsultationByIdPatient(paginator, idPatient).pipe(
            map((response: ResponseDTO) => {
                if (!response.isSuccess) {
                    this._notificationService.showToastErrorMessage(response.message!);
                }
                return response.data;
            })
        );
    }

    CreateMedicalConsultationWithMedicalDiagnosis(medicalConsultation: MedicalConsultationDTO): Observable<ResponseDTO> {
        return this._medicalConsultationService.CreateMedicalConsultationWithMedicalDiagnosis(medicalConsultation).pipe(
            map((response: ResponseDTO) => {
                if (response.isSuccess) {
                    this._notificationService.showToastSuccessMessage(response.message || 'Consulta creada exitosamente');
                } else {
                    this._notificationService.showToastErrorMessage(response.message || 'Ocurrió un error al crear la consulta');
                }
                return response; // retornas el objeto completo
            })
        );
    }

}