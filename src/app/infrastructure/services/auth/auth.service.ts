import { Injectable } from "@angular/core";
import { Observable, map, of, switchMap } from "rxjs";
import { HttpService } from "../http-services/http-service.service";
import { ResponseDTO } from "src/app/core/DTOs/common/response/response.dto";
import { Router } from "@angular/router";
import { ConfigService } from "../common/config/config.service";

@Injectable({
  providedIn: "root",
})
export class AuthService {
    
  constructor(private _httpService: HttpService, 
    private _configService: ConfigService,
    private _router: Router) {}

/*   login(userName: string, password: string): Observable<ResponseDTO> {
    const params = { userName, password };
    
    return this._httpService.post("", "'auth/login'", params);
  } */
    login(username: string, password: string): Observable<ResponseDTO> {
      return this._configService.getUrl().pipe(
          switchMap(url => {
              const body = { username, password };
              return this._httpService.post(url, "auth/login", null, body);
          })
      );
  }

  isLoggedIn(): Observable<boolean> {
    const authToken = localStorage.getItem("authToken");
    return of(!!authToken);
  }

  logout() {
    localStorage.clear();
    this._router.navigate(["/auth/login"]);
  }
}
