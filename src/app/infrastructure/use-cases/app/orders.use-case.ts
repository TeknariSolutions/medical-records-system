import { Injectable } from "@angular/core";
import { map, Observable, of } from "rxjs";
import { NotificationsService } from "../../services/common/notifications/notifications.service";
import { ResponseDTO } from "src/app/core/DTOs/common/response/response.dto";
import { OrdersService } from "../../services/app/orders.service";
import { OrderDTO } from "src/app/core/DTOs/app/order.dto";

@Injectable({
    providedIn: "root",
})

export class OrdersUseCase {

    constructor(private _ordersService: OrdersService,
        private _notificationService: NotificationsService
    ) { }

    CreateOrders(order: OrderDTO): Observable<ResponseDTO> {
        return this._ordersService.CreateOrders(order).pipe(
            map((response: ResponseDTO) => {
                if (response.isSuccess) {
                    this._notificationService.showToastSuccessMessage(response.message || 'Prescripcion creada exitosamente');
                } else {
                    this._notificationService.showToastErrorMessage(response.message || 'Ocurrió un error al crear la prescripcion');
                }
                return response;
            })
        );
    }

    UpdateOrders(order: OrderDTO): Observable<ResponseDTO> {
        return this._ordersService.UpdateOrders(order).pipe(
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

    GetListOrders(idMedicalConsultation?: number): Observable<ResponseDTO> {
        return this._ordersService.GetListOrders(idMedicalConsultation).pipe(
            map((response: ResponseDTO) => {
                if (!response.isSuccess) {
                    this._notificationService.showToastErrorMessage(response.message!);
                }
                return response.data;
            })
        );
    }

    DeleteOrderById(idOrder: number): Observable<boolean> {
        return this._ordersService.DeleteOrderById(idOrder).pipe(
            map((response: ResponseDTO) => {
                if (!response.isSuccess) {
                    this._notificationService.showToastErrorMessage(response.message!);
                } else {
                    this._notificationService.showToastSuccessMessage(response.message!);
                }
                return response.data;
            })
        );
    }

}