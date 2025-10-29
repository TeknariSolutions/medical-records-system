import { Injectable } from "@angular/core";
import { map, Observable, of } from "rxjs";
import { NotificationsService } from "../../services/common/notifications/notifications.service";
import { ResponseDTO } from "src/app/core/DTOs/common/response/response.dto";
import { MedicalEquipmentService } from "../../services/app/medical-equipment.service";
import { MedicalEquipmentDTO } from "src/app/core/DTOs/app/medical-equipment.dto";
import { PaginatorDTO } from "src/app/core/DTOs/common/paginator/paginator.dto";

@Injectable({
    providedIn: "root",
})

export class MedicalEquipmentsUseCase {

    constructor(private _medicalEquipmentService: MedicalEquipmentService,
        private _notificationService: NotificationsService
    ) { }

    CreateMedicalEquipment(equipment: MedicalEquipmentDTO): Observable<ResponseDTO> {
        return this._medicalEquipmentService.CreateMedicalEquipment(equipment).pipe(
            map((response: ResponseDTO) => {
                if (response.isSuccess) {
                    this._notificationService.showToastSuccessMessage(response.message || 'Equipo creado exitosamente');
                } else {
                    this._notificationService.showToastErrorMessage(response.message || 'Ocurrió un error al crear el equipo');
                }
                return response;
            })
        );
    }

    UpdateMedicalEquipment(equipment: MedicalEquipmentDTO): Observable<ResponseDTO> {
        return this._medicalEquipmentService.UpdateMedicalEquipment(equipment).pipe(
            map((response: ResponseDTO) => {
                if (response.isSuccess) {
                    this._notificationService.showToastSuccessMessage(response.message || 'Equipo actualizado exitosamente');
                } else {
                    this._notificationService.showToastErrorMessage(response.message || 'Ocurrió un error al actualizar el equipo');
                }
                return response;
            })
        );
    }

    GetListMedicalEquipment(paginator: PaginatorDTO): Observable<any> {
        return this._medicalEquipmentService.GetListMedicalEquipment(paginator).pipe(
            map((response: ResponseDTO) => {
                if (!response.isSuccess) {
                    this._notificationService.showToastErrorMessage(response.message!);
                }
                return response.data;
            })
        );
    }

}