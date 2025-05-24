import { Injectable } from "@angular/core";
import { RolesService } from "../../services/app/roles.service";
import { NotificationsService } from "../../services/common/notifications/notifications.service";
import { map, Observable } from "rxjs";
import { TableResultDTO } from "src/app/core/DTOs/common/table-result/table-result.dto";
import { PaginatorDTO } from "src/app/core/DTOs/common/paginator/paginator.dto";
import { ResponseDTO } from "src/app/core/DTOs/common/response/response.dto";


@Injectable({
    providedIn: "root",
})

export class RolesUseCase {
    constructor(private _rolesService: RolesService,
        private _notificationService: NotificationsService
    ) { }

    GetListRoles(paginator: PaginatorDTO, description?: string): Observable<TableResultDTO> {
        return this._rolesService.GetListRoles(paginator, description).pipe(
            map((response: ResponseDTO) => {
                if (!response.isSuccess) {
                    this._notificationService.showToastErrorMessage(response.message!);
                    console.log("error");
                }
                return response.data;
            })
        );
    }

}