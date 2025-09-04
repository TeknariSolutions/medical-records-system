import { Injectable } from "@angular/core";
import { Observable, of } from "rxjs";
import { map, switchMap } from "rxjs/operators";
import { ResponseDTO } from "src/app/core/DTOs/common/response/response.dto";
import { NotificationsService } from "../../services/common/notifications/notifications.service";
import { Cie10Service } from "../../services/common/CIE10/cie10.service";
import { PaginatorDTO } from "src/app/core/DTOs/common/paginator/paginator.dto";
import { TableResultDTO } from "src/app/core/DTOs/common/table-result/table-result.dto";

@Injectable({
    providedIn: "root",
})
export class Cie10UseCase {

    constructor(private _Cie10Service: Cie10Service,
        private _notificationService: NotificationsService
    ) { }

    GetListCIECodes(paginator: PaginatorDTO, description?: string, code?: string, name?: string): Observable<TableResultDTO> {
        return this._Cie10Service.GetListCIECodes(paginator, description, code, name).pipe(
            map((response: ResponseDTO) => {
                if (!response.isSuccess) {
                    this._notificationService.showToastErrorMessage(response.message!);
                }
                return response.data;
            })
        );
    }

}