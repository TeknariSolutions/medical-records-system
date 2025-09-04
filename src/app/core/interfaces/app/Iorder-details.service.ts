import { Observable } from 'rxjs';
import { ResponseDTO } from '../../DTOs/common/response/response.dto';
import { OrderDetailsDTO } from '../../DTOs/app/order-details.dto';

export interface IOrderDetailsService {
    CreateOrderDetails(orderDetail: OrderDetailsDTO): Observable<ResponseDTO>;
    UpdateOrderDetails(orderDetail: OrderDetailsDTO): Observable<ResponseDTO>;
    GetListOrderDetailsByOrder(idOrder?: number): Observable<ResponseDTO>;
}