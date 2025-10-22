import { Injectable } from "@angular/core";
import { map, Observable, of } from "rxjs";
import { NotificationsService } from "../../services/common/notifications/notifications.service";
import { ResponseDTO } from "src/app/core/DTOs/common/response/response.dto";
import { PaginatorDTO } from "src/app/core/DTOs/common/paginator/paginator.dto";
import { CUPSCodeService } from "../../services/common/CUPS-Code/cups-code.service";


@Injectable({
    providedIn: "root",
})

export class CupsCodeUseCase {
    constructor(private _CUPSCodeService: CUPSCodeService,
        private _notificationService: NotificationsService
    ) { }


    GetListCUPS_Codes(paginator: PaginatorDTO, code?: string, name?: string): Observable<any> {
        return this._CUPSCodeService.GetListCUPS_Codes(paginator, code, name).pipe(
            map((response: ResponseDTO) => {
                if (!response.isSuccess) {
                    this._notificationService.showToastErrorMessage(response.message!);
                }
                return response.data;
            })
        );
    }
    

    GetCUPSCodeById(idCUPSCode: number): Observable<any> {
        return this._CUPSCodeService.GetCUPSCodeById(idCUPSCode).pipe(
            map((response: ResponseDTO) => {
                if (!response.isSuccess) {
                    this._notificationService.showToastErrorMessage(response.message!);
                }
                return response.data;
            })
        );
    }

    GetCupsConsultationneumology(): Observable<any> {
        return this._CUPSCodeService.GetCupsConsultationneumology().pipe(
            map((response: ResponseDTO) => {
                if (!response.isSuccess) {
                    this._notificationService.showToastErrorMessage(response.message!);
                }
                return response.data;
            })
        );
    }

}