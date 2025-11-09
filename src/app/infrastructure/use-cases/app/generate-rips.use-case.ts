import { Injectable } from "@angular/core";
import { map, Observable, of } from "rxjs";
import { NotificationsService } from "../../services/common/notifications/notifications.service";
import { ResponseDTO } from "src/app/core/DTOs/common/response/response.dto";
import { TableResultDTO } from "src/app/core/DTOs/common/table-result/table-result.dto";
import { GenerateRipsService } from "../../services/app/generate-rips.service";

@Injectable({
    providedIn: "root",
})

export class GenerateRipsUseCase {
    constructor(private _generateRipsService: GenerateRipsService,
        private _notificationService: NotificationsService
    ) { }

    GenerateRips(idEps?: number, startDate?: Date, endDate?: Date): Observable<any> {
        return this._generateRipsService.GenerateRips(idEps, startDate, endDate).pipe(
            map((response: ResponseDTO) => {
                if (!response.isSuccess) {
                    this._notificationService.showToastErrorMessage(response.message!);
                }
                return response;
            })
        );
    }

}