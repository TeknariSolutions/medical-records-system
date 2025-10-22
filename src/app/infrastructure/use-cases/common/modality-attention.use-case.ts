import { Injectable } from "@angular/core";
import { map, Observable, of } from "rxjs";
import { NotificationsService } from "../../services/common/notifications/notifications.service";
import { ResponseDTO } from "src/app/core/DTOs/common/response/response.dto";
import { ModalityAttentionService } from "../../services/common/modality/modality-attention.service";


@Injectable({
    providedIn: "root",
})

export class ModalityAttentionUseCase {
    constructor(private _modalityAttentionService: ModalityAttentionService,
        private _notificationService: NotificationsService
    ) { }

    GetListModalityAttention(): Observable<any> {
        return this._modalityAttentionService.GetListModalityAttention().pipe(
            map((response: ResponseDTO) => {
                if (!response.isSuccess) {
                    this._notificationService.showToastErrorMessage(response.message!);
                }
                return response.data;
            })
        );
    }

}