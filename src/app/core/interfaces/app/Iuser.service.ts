import { Observable } from 'rxjs';
import { UserDTO } from '../../DTOs/app/user.dto';
import { ResponseDTO } from '../../DTOs/common/response/response.dto';
import { PaginatorDTO } from '../../DTOs/common/paginator/paginator.dto';

export interface IUserService {
   CreateUser(user: UserDTO): Observable<ResponseDTO>;
   UpdateUser(user: UserDTO): Observable<ResponseDTO>;
   DeleteUser(idUser: number): Observable<ResponseDTO>;
   GetListUsers(paginator: PaginatorDTO, Email?: string): Observable<ResponseDTO>;
}
