import { Injectable } from "@angular/core";
import { map, Observable, of } from "rxjs";
import { NotificationsService } from "../../services/common/notifications/notifications.service";
import { ResponseDTO } from "src/app/core/DTOs/common/response/response.dto";
import { PaginatorDTO } from "src/app/core/DTOs/common/paginator/paginator.dto";
import { TableResultDTO } from "src/app/core/DTOs/common/table-result/table-result.dto";
import { MedicalConsultationService } from "../../services/app/medical-consultation.service";
import { MedicalConsultationDTO } from "src/app/core/DTOs/app/medical-consultation.dto";
import { MedicalConsultationByIdDTO } from "src/app/core/DTOs/app/medical-consultation-by-id.dto";

@Injectable({
    providedIn: "root",
})

export class MedicalConsultationUseCase {
    constructor(private _medicalConsultationService: MedicalConsultationService,
        private _notificationService: NotificationsService
    ) { }

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

    GetListMedicalConsultationByIdPatient(paginator: PaginatorDTO, idPatient?: number, Status?: boolean, ConsultationDate?: string): Observable<TableResultDTO> {
        return this._medicalConsultationService.GetListMedicalConsultationByIdPatient(paginator, idPatient, Status, ConsultationDate).pipe(
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

    GetMedicalConsultationById(IdMedicalConsultation?: number): Observable<MedicalConsultationByIdDTO> {
        return this._medicalConsultationService.GetMedicalConsultationById(IdMedicalConsultation).pipe(
            map((response: ResponseDTO) => {
                if (!response.isSuccess) {
                    this._notificationService.showToastErrorMessage(response.message!);
                }
                return response.data as MedicalConsultationByIdDTO;
            })
        );
    }

    GetListMedicalConsultationByStatus(paginator: PaginatorDTO): Observable<TableResultDTO> {
        return this._medicalConsultationService.GetListMedicalConsultationByStatus(paginator).pipe(
            map((response: ResponseDTO) => {
                if (!response.isSuccess) {
                    this._notificationService.showToastErrorMessage(response.message!);
                }
                return response.data;
            })
        );
    }

}