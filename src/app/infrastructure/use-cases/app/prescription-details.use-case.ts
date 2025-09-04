import { Injectable } from "@angular/core";
import { map, Observable, of } from "rxjs";
import { NotificationsService } from "../../services/common/notifications/notifications.service";
import { ResponseDTO } from "src/app/core/DTOs/common/response/response.dto";
import { PrescriptionDetailsService } from "../../services/app/prescription-details.service";
import { PrescriptionDetailDTO } from "src/app/core/DTOs/app/prescription-details.dto";
import { TableResultDTO } from "src/app/core/DTOs/common/table-result/table-result.dto";

@Injectable({
    providedIn: "root",
})

export class PrescriptionDetailsUseCase {

    constructor(private _prescriptionDetailsService: PrescriptionDetailsService,
        private _notificationService: NotificationsService
    ) { }

    CreatePrescriptionDetails(prescriptionDetail: PrescriptionDetailDTO): Observable<ResponseDTO> {
        return this._prescriptionDetailsService.CreatePrescriptionDetails(prescriptionDetail).pipe(
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

    UpdatePrescriptionDetails(prescriptionDetail: PrescriptionDetailDTO): Observable<ResponseDTO> {
        return this._prescriptionDetailsService.UpdatePrescriptionDetails(prescriptionDetail).pipe(
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


    GetPrescriptionDetailsByIdPrescription(idPrescription?: number): Observable<TableResultDTO> {
        return this._prescriptionDetailsService.GetPrescriptionDetailsByIdPrescription(idPrescription).pipe(
            map((response: ResponseDTO) => {
                if (!response.isSuccess) {
                    this._notificationService.showToastErrorMessage(response.message!);
                }
                return response.data;
            })
        );
    }
}