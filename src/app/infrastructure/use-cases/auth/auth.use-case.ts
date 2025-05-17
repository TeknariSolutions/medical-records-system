import { Injectable } from "@angular/core";
import { Observable, of } from "rxjs";
import { switchMap } from "rxjs/operators";
import { ResponseDTO } from "src/app/core/DTOs/common/response/response.dto";
import { AuthService } from "../../services/auth/auth.service";

@Injectable({
  providedIn: "root",
})
export class AuthUseCase {
  // _notificationType = NotificationType;

  constructor(private _auth: AuthService) {}

  login(user: string, password: string): Observable<boolean> {
    return this._auth.login(user, password).pipe(
      switchMap((response: ResponseDTO) => {
        if (response.isSuccess) {
          const authToken = response.data;
          localStorage.setItem("authToken", authToken);
          return of(true);
        } else {
          /* this._notificationsService.openNotification({
                    type: this._notificationType.ERROR,
                    title: response.message!,
                }); */
          return of(false);
        }
      })
    );
  }

  isLoggedIn(): Observable<boolean> {
    const authToken = localStorage.getItem("authToken");
    return of(!!authToken);
  }

  logout(): Observable<boolean> {
    localStorage.removeItem("authToken");
    localStorage.clear();
    sessionStorage.clear();
    return of(true);
  }
}
