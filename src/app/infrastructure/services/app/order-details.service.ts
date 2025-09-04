import { Injectable } from '@angular/core';
import { HttpService } from '../http-services/http-service.service';
import { ConfigService } from '../common/config/config.service';
import { Observable, switchMap } from 'rxjs';
import { ResponseDTO } from 'src/app/core/DTOs/common/response/response.dto';
import { OrderDetailsDTO } from 'src/app/core/DTOs/app/order-details.dto';
import { IOrderDetailsService } from 'src/app/core/interfaces/app/Iorder-details.service';

@Injectable({
  providedIn: 'root'
})
export class OrderDetailsService implements IOrderDetailsService {

  constructor(
    private _httpService: HttpService,
    private _configService: ConfigService
  ) { }


  CreateOrderDetails(orderDetail: OrderDetailsDTO): Observable<ResponseDTO> {
    return this._configService.getUrl().pipe(
      switchMap(url => {
        return this._httpService.post(url, "CreateOrderDetails", null, orderDetail);
      })
    );
  }

  UpdateOrderDetails(orderDetail: OrderDetailsDTO): Observable<ResponseDTO> {
    return this._configService.getUrl().pipe(
      switchMap(url => {
        return this._httpService.put(url, "UpdateOrderDetails", null, orderDetail);
      })
    );
  }


  GetListOrderDetailsByOrder(idOrder?: number): Observable<ResponseDTO> {
    return this._configService.getUrl().pipe(
      switchMap(url => {
        let params: any = {
          idOrder
        };
        return this._httpService.get<ResponseDTO>(url, "GetListOrderDetailsByOrder", params);
      })
    );
  }

}
