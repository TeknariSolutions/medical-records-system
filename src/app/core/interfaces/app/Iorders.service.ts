import { Observable } from 'rxjs';
import { ResponseDTO } from '../../DTOs/common/response/response.dto';
import { OrderDTO } from '../../DTOs/app/order.dto';

export interface IOrdersService {
    CreateOrders(order: OrderDTO): Observable<ResponseDTO>;
    UpdateOrders(order: OrderDTO): Observable<ResponseDTO>;
    GetListOrders(idMedicalConsultation?: number): Observable<ResponseDTO>;
}