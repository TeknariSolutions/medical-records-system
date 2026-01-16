import { Injectable } from '@angular/core';
import { HttpService } from '../http-services/http-service.service';
import { ConfigService } from '../common/config/config.service';
import { Observable, switchMap } from 'rxjs';
import { ResponseDTO } from 'src/app/core/DTOs/common/response/response.dto';
import { OrderDTO } from 'src/app/core/DTOs/app/order.dto';
import { IOrdersService } from 'src/app/core/interfaces/app/Iorders.service';

@Injectable({
  providedIn: 'root'
})
export class OrdersService implements IOrdersService {

  constructor(
    private _httpService: HttpService,
    private _configService: ConfigService
  ) { }


  CreateOrders(order: OrderDTO): Observable<ResponseDTO> {
    return this._configService.getUrl().pipe(
      switchMap(url => {
        return this._httpService.post(url, "CreateOrders", null, order);
      })
    );
  }

  UpdateOrders(order: OrderDTO): Observable<ResponseDTO> {
    return this._configService.getUrl().pipe(
      switchMap(url => {
        return this._httpService.put(url, "UpdateOrders", null, order);
      })
    );
  }

  
  GetListOrders(idMedicalConsultation?: number): Observable<ResponseDTO> {
    return this._configService.getUrl().pipe(
      switchMap(url => {
        let params: any = {
          idMedicalConsultation
        };
        return this._httpService.get<ResponseDTO>(url, "GetListOrders", params);
      })
    );
  }

   DeleteOrderById(idOrder: number): Observable<ResponseDTO> {
    return this._configService.getUrl().pipe(
      switchMap(url => {
        let params: any = {
          idOrder
        }
        return this._httpService.delete(url, "DeleteOrderById", params);
      })
    );
  }
}
