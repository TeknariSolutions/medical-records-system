import { Injectable } from "@angular/core";
import { map, Observable, of } from "rxjs";
import { NotificationsService } from "../../services/common/notifications/notifications.service";
import { ResponseDTO } from "src/app/core/DTOs/common/response/response.dto";
import { PaginatorDTO } from "src/app/core/DTOs/common/paginator/paginator.dto";
import { TableResultDTO } from "src/app/core/DTOs/common/table-result/table-result.dto";
import { CloseConsultationService } from "../../services/app/close-consultation.service";

@Injectable({
    providedIn: "root",
})

export class CloseConsultationUseCase {
    constructor(private _closeConsultationService: CloseConsultationService,
        private _notificationService: NotificationsService
    ) { }

    GetExitConditions(): Observable<any> {
        return this._closeConsultationService.GetExitConditions().pipe(
            map((response: ResponseDTO) => {
                if (!response.isSuccess) {
                    this._notificationService.showToastErrorMessage(response.message!);
                }
                return response.data;
            })
        );
    }

    GetExternalCauseCodes(): Observable<any> {
        return this._closeConsultationService.GetExternalCauseCodes().pipe(
            map((response: ResponseDTO) => {
                if (!response.isSuccess) {
                    this._notificationService.showToastErrorMessage(response.message!);
                }
                return response.data;
            })
        );
    }


    GetConsultationFinalities(): Observable<any> {
        return this._closeConsultationService.GetConsultationFinalities().pipe(
            map((response: ResponseDTO) => {
                if (!response.isSuccess) {
                    this._notificationService.showToastErrorMessage(response.message!);
                }
                return response.data;
            })
        );
    }

}
