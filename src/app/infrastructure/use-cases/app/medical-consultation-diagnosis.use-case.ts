import { Injectable } from "@angular/core";
import { map, Observable, of } from "rxjs";
import { NotificationsService } from "../../services/common/notifications/notifications.service";
import { ResponseDTO } from "src/app/core/DTOs/common/response/response.dto";
import { MedicalConsultationDiagnosisService } from "../../services/app/medical-consultation-diagnosis.service";
import { MedicalDiagnosisDTO } from "src/app/core/DTOs/app/medical-diagnosis.dto";

@Injectable({
    providedIn: "root",
})


export class MedicalConsultationDiagnosisUseCase {
    constructor(private _medicalConsultationDiagnosisService: MedicalConsultationDiagnosisService,
        private _notificationService: NotificationsService
    ) { }

    CreateMedicalConsultationDiagnosis(medicalConsultationDiagnosis: MedicalDiagnosisDTO): Observable<ResponseDTO> {
        return this._medicalConsultationDiagnosisService.CreateMedicalConsultationDiagnosis(medicalConsultationDiagnosis).pipe(
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


    UpdateMedicalConsultationDiagnosis(medicalConsultationDiagnosis: MedicalDiagnosisDTO): Observable<ResponseDTO> {
        return this._medicalConsultationDiagnosisService.UpdateMedicalConsultationDiagnosis(medicalConsultationDiagnosis).pipe(
            map((response: ResponseDTO) => {
                if (response.isSuccess) {
                    this._notificationService.showToastSuccessMessage(response.message || 'Diagnosticos actualizados exitosamente');
                } else {
                    this._notificationService.showToastErrorMessage(response.message || 'Ocurrió un error al actualizar los diagnosticos');
                }

                return response; 
            })
        );
    }


    GetListMedicalConsultationDiagnosisByIdMedicalConsultation(idMedicalConsultation?: number): Observable<MedicalDiagnosisDTO[]> {
        return this._medicalConsultationDiagnosisService
            .GetListMedicalConsultationDiagnosisByIdMedicalConsultation(idMedicalConsultation)
            .pipe(
                map((response: ResponseDTO) => {
                    if (!response.isSuccess) {
                        this._notificationService.showToastErrorMessage(response.message!);
                        return [];
                    }
                    return response.data as MedicalDiagnosisDTO[];
                })
            );
    }



}

