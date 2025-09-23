import { Injectable } from "@angular/core";
import { map, Observable, of } from "rxjs";
import { PatientsService } from "../../services/app/patients.service";
import { NotificationsService } from "../../services/common/notifications/notifications.service";
import { PatientDTO } from "src/app/core/DTOs/app/patient.dto";
import { ResponseDTO } from "src/app/core/DTOs/common/response/response.dto";
import { PaginatorDTO } from "src/app/core/DTOs/common/paginator/paginator.dto";
import { TableResultDTO } from "src/app/core/DTOs/common/table-result/table-result.dto";
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

}