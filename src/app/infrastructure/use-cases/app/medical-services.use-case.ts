import { Injectable } from "@angular/core";
import { map, Observable, of } from "rxjs";
import { NotificationsService } from "../../services/common/notifications/notifications.service";
import { ResponseDTO } from "src/app/core/DTOs/common/response/response.dto";
import { MedicalServicesService } from "../../services/app/medical-services.service";


@Injectable({
    providedIn: "root",
})

export class MedicalServicesUseCase {
    constructor(private _medicalServicesService: MedicalServicesService,
        private _notificationService: NotificationsService
    ) { }

    GetMedicalServicesNeumology(): Observable<any> {
        return this._medicalServicesService.GetMedicalServicesNeumology().pipe(
            map((response: ResponseDTO) => {
                if (!response.isSuccess) {
                    this._notificationService.showToastErrorMessage(response.message!);
                }
                return response.data;
            })
        );
    }

}