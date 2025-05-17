import { Injectable } from "@angular/core";
import { Observable, of } from "rxjs";
import { map, switchMap } from "rxjs/operators";
import { ResponseDTO } from "src/app/core/DTOs/common/response/response.dto";
import { UsersService } from "../../services/app/users.service";
import { UserDTO } from "src/app/core/DTOs/app/user.dto";
import { PaginatorDTO } from "src/app/core/DTOs/common/paginator/paginator.dto";
import { TableResultDTO } from "src/app/core/DTOs/common/table-result/table-result.dto";

@Injectable({
  providedIn: "root",
})
export class UsersUseCase {
  constructor(private _userService: UsersService) {}

  CreateUser(user: UserDTO): Observable<boolean> {
    return this._userService.CreateUser(user).pipe(
      map((response: ResponseDTO) => {
        if (!response.isSuccess) {
          //this._notificationService.showToastErrorMessage(response.message!);
          console.log("error");
        }
        return response.data;
      })
    );
  }

  UpdateUser(user: UserDTO): Observable<boolean> {
    return this._userService.UpdateUser(user).pipe(
      map((response: ResponseDTO) => {
        if (!response.isSuccess) {
          //this._notificationService.showToastErrorMessage(response.message!);
          console.log("error");
        } else {
          //this._notificationService.showToastSuccessMessage(response.message!);
          console.log("correcto");
        }
        return response.data;
      })
    );
  }

  DeleteUser(idUser: number): Observable<boolean> {
    return this._userService.DeleteUser(idUser).pipe(
      map((response: ResponseDTO) => {
        if (!response.isSuccess) {
          //this._notificationService.showToastErrorMessage(response.message!);
          console.log("error");
        }
        return response.data;
      })
    );
  }

  GetListUsers(paginator: PaginatorDTO, Email: string): Observable<TableResultDTO> {
    return this._userService.GetListUsers(paginator, Email).pipe(
      map((response: ResponseDTO) => {
        if (!response.isSuccess) {
          //this._notificationService.showToastErrorMessage(response.message!);
          console.log("error");
        }
        return response.data;
      })
    );
  }
}
