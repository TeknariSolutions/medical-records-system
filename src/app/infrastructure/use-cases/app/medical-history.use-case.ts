import { Injectable } from "@angular/core";
import { map, Observable, of } from "rxjs";
import { NotificationsService } from "../../services/common/notifications/notifications.service";
import { ResponseDTO } from "src/app/core/DTOs/common/response/response.dto";
import { PaginatorDTO } from "src/app/core/DTOs/common/paginator/paginator.dto";
import { MedicalHistoryService } from "../../services/app/medical-history.service";
import { MedicalHistoryDTO } from "src/app/core/DTOs/app/medical-history.dto";
import { TableResultDTO } from "src/app/core/DTOs/common/table-result/table-result.dto";

@Injectable({
    providedIn: "root",
})

export class MedicalHistoryUseCase {

    constructor(private _medicalHistoryService: MedicalHistoryService,
        private _notificationService: NotificationsService
    ) { }

 
    CreateMedicalHistory(medicalHistory: MedicalHistoryDTO): Observable<ResponseDTO> {
        return this._medicalHistoryService.CreateMedicalHistory(medicalHistory).pipe(
            map((response: ResponseDTO) => {
                if (response.isSuccess) {
                    this._notificationService.showToastSuccessMessage(response.message || 'Antecedentes creados exitosamente');
                } else {
                    this._notificationService.showToastErrorMessage(response.message || 'Ocurrió un error al crear los antecedentes');
                }
                return response; 
            })
        );
    }

    UpdateMedicalHistory(medicalHistory: MedicalHistoryDTO): Observable<ResponseDTO> {
        return this._medicalHistoryService.UpdateMedicalHistory(medicalHistory).pipe(
            map((response: ResponseDTO) => {
                if (response.isSuccess) {
                    this._notificationService.showToastSuccessMessage(response.message || 'Antecedentes actualizada exitosamente');
                } else {
                    this._notificationService.showToastErrorMessage(response.message || 'Ocurrió un error al actualizar los Antecedentes');
                }

                return response; // retornas el objeto completo
            })
        );
    }

    GetListMedicalHistoryPatient(paginator: PaginatorDTO, idPatient?: number): Observable<TableResultDTO> {
        return this._medicalHistoryService.GetListMedicalHistoryPatient(paginator, idPatient).pipe(
            map((response: ResponseDTO) => {
                if (!response.isSuccess) {
                    this._notificationService.showToastErrorMessage(response.message!);
                }
                return response.data;
            })
        );
    }

   /*  GetLastMedicalHistory(idPatient?: number): Observable<TableResultDTO> {
        return this._medicalHistoryService.GetLastMedicalHistory(idPatient).pipe(
            map((response: ResponseDTO) => {
                if (!response.isSuccess) {
                    this._notificationService.showToastErrorMessage(response.message!);
                }
                return response.data;
            })
        );
    } */

    GetLastMedicalHistory(idPatient?: number): Observable<MedicalHistoryDTO> {
        return this._medicalHistoryService.GetLastMedicalHistory(idPatient).pipe(
            map((response: ResponseDTO) => {
                if (!response.isSuccess) {
                    this._notificationService.showToastErrorMessage(response.message!);
                }
                return response.data as MedicalHistoryDTO; // aseguras tipado
            })
        );
    }


}