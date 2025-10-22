import { Injectable } from "@angular/core";
import { map, Observable, of } from "rxjs";
import { NotificationsService } from "../../services/common/notifications/notifications.service";
import { ResponseDTO } from "src/app/core/DTOs/common/response/response.dto";
import { PaginatorDTO } from "src/app/core/DTOs/common/paginator/paginator.dto";
import { CUPSCodeService } from "../../services/common/CUPS-Code/cups-code.service";
import { EpsService } from "../../services/common/EPS/eps.service";


@Injectable({
    providedIn: "root",
})

export class EpsUseCase {
    constructor(private _epsService: EpsService,
        private _notificationService: NotificationsService
    ) { }

    GetEps(epsName: string): Observable<any> {
        return this._epsService.GetEps(epsName).pipe(
            map((response: ResponseDTO) => {
                if (!response.isSuccess) {
                    this._notificationService.showToastErrorMessage(response.message!);
                }
                return response.data;
            })
        );
    }

}