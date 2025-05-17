import { Injectable } from '@angular/core';
import { HttpService } from '../http-services/http-service.service';
import { ConfigService } from '../common/config/config.service';
import { Observable, switchMap } from 'rxjs';
import { ResponseDTO } from 'src/app/core/DTOs/common/response/response.dto';
import { UserDTO } from 'src/app/core/DTOs/app/user.dto';
import { PaginatorDTO } from 'src/app/core/DTOs/common/paginator/paginator.dto';
import { IUserService } from 'src/app/core/interfaces/app/Iuser.service';

@Injectable({
  providedIn: 'root'
})
export class UsersService implements IUserService {

  constructor(
    private _httpService: HttpService,
    private _configService: ConfigService
  ) { }

  CreateUser(user: UserDTO): Observable<ResponseDTO> {
    return this._configService.getUrl().pipe(
      switchMap(url => {
        return this._httpService.post(url, "api/User/CreateUser", null, user);
      })
    );
  }

  UpdateUser(user: UserDTO): Observable<ResponseDTO> {
    return this._configService.getUrl().pipe(
      switchMap(url => {
        return this._httpService.put(url, "api/User/UpdateUser", null, user);
      })
    );
  }

  DeleteUser(idUser: number): Observable<ResponseDTO> {
    return this._configService.getUrl().pipe(
      switchMap(url => {
        let params: any = {
          idUser
        }
        return this._httpService.delete(url, "api/User/DeleteUser", params);
      })
    );
  }

  GetListUsers(paginator: PaginatorDTO, Email?: string): Observable<ResponseDTO> {
    return this._configService.getUrl().pipe(
      switchMap(url => {
        let params: any = {
          PageIndex: paginator.pageIndex,
          PageSize: paginator.pageSize,
          Email
        };
        return this._httpService.get<ResponseDTO>(url, "api/User/GetListUsers", params);
      })
    );
  }
  
}
