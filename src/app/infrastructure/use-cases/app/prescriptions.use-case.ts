import { Injectable } from "@angular/core";
import { map, Observable, of } from "rxjs";
import { NotificationsService } from "../../services/common/notifications/notifications.service";
import { ResponseDTO } from "src/app/core/DTOs/common/response/response.dto";
import { PrescriptionService } from "../../services/app/prescription.service";
import { PrescriptionDTO } from "src/app/core/DTOs/app/prescription.dto";
import { TableResultDTO } from "src/app/core/DTOs/common/table-result/table-result.dto";

@Injectable({
    providedIn: "root",
})

export class PrescriptionsUseCase {

    constructor(private _prescriptionService: PrescriptionService,
        private _notificationService: NotificationsService
    ) { }

    CreatePrescription(prescription: PrescriptionDTO): Observable<ResponseDTO> {
        return this._prescriptionService.CreatePrescription(prescription).pipe(
            map((response: ResponseDTO) => {
                if (response.isSuccess) {
                    this._notificationService.showToastSuccessMessage(response.message || 'Prescripcion creada exitosamente');
                } else {
                    this._notificationService.showToastErrorMessage(response.message || 'Ocurrió un error al crear la prescripcion');
                }
                return response; 
            })
        );
    }

    GetListPrescriptions(idMedicalConsultation?: number): Observable<ResponseDTO> {
        return this._prescriptionService.GetListPrescriptions(idMedicalConsultation).pipe(
            map((response: ResponseDTO) => {
                if (!response.isSuccess) {
                    this._notificationService.showToastErrorMessage(response.message!);
                }
                return response.data;
            })
        );
    }

}