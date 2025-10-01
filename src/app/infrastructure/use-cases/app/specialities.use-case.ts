import { Injectable } from "@angular/core";
import { map, Observable, of } from "rxjs";
import { NotificationsService } from "../../services/common/notifications/notifications.service";
import { ResponseDTO } from "src/app/core/DTOs/common/response/response.dto";
import { PaginatorDTO } from "src/app/core/DTOs/common/paginator/paginator.dto";
import { TableResultDTO } from "src/app/core/DTOs/common/table-result/table-result.dto";
import { SpecialitiesService } from "../../services/app/specialities.service";

@Injectable({
    providedIn: "root",
})

export class SpecialitiesUseCase {
    constructor(private _specialitiesService: SpecialitiesService,
        private _notificationService: NotificationsService
    ) { }

    GetListSpecialities(paginator: PaginatorDTO, description?: string): Observable<TableResultDTO> {
        return this._specialitiesService.GetListSpecialities(paginator, description).pipe(
            map((response: ResponseDTO) => {
                if (!response.isSuccess) {
                    this._notificationService.showToastErrorMessage(response.message!);
                }
                return response.data;
            })
        );
    }

}
