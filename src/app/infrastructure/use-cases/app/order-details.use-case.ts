import { Injectable } from "@angular/core";
import { map, Observable, of } from "rxjs";
import { NotificationsService } from "../../services/common/notifications/notifications.service";
import { ResponseDTO } from "src/app/core/DTOs/common/response/response.dto";
import { OrderDetailsService } from "../../services/app/order-details.service";
import { OrderDetailsDTO } from "src/app/core/DTOs/app/order-details.dto";

@Injectable({
    providedIn: "root",
})

export class OrderDetailsUseCase {

    constructor(private _orderDetailsService: OrderDetailsService,
        private _notificationService: NotificationsService
    ) { }

    CreateOrderDetails(orderDetail: OrderDetailsDTO): Observable<ResponseDTO> {
        return this._orderDetailsService.CreateOrderDetails(orderDetail).pipe(
            map((response: ResponseDTO) => {
                if (response.isSuccess) {
                    this._notificationService.showToastSuccessMessage(response.message || 'Orden creada exitosamente');
                } else {
                    this._notificationService.showToastErrorMessage(response.message || 'Ocurrió un error al crear la Orden');
                }
                return response;
            })
        );
    }


    UpdateOrderDetails(orderDetail: OrderDetailsDTO): Observable<ResponseDTO> {
        return this._orderDetailsService.UpdateOrderDetails(orderDetail).pipe(
            map((response: ResponseDTO) => {
                if (response.isSuccess) {
                    this._notificationService.showToastSuccessMessage(response.message || 'Orden creada exitosamente');
                } else {
                    this._notificationService.showToastErrorMessage(response.message || 'Ocurrió un error al crear la Orden');
                }
                return response;
            })
        );
    }

    GetListOrderDetailsByOrder(idOrder?: number): Observable<any> {
        return this._orderDetailsService.GetListOrderDetailsByOrder(idOrder).pipe(
            map((response: ResponseDTO) => {
                if (!response.isSuccess) {
                    this._notificationService.showToastErrorMessage(response.message!);
                }
                return response.data;
            })
        );
    }

}