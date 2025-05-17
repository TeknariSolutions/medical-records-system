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
    private _router: Router) { }


  login(email: string, password: string): Observable<ResponseDTO> {
    return this._configService.getUrl().pipe(
      switchMap(url => {
        const body = { email, password };
        return this._httpService.post(url, "Auth", null, body);
      })
    );
  } 

 /*  login(email: string, password: string): Observable<ResponseDTO> {
        const params = {
            email,
            password
        };
        return this._httpService.post("Auth", params);
    } */




  isLoggedIn(): Observable<boolean> {
    const authToken = localStorage.getItem("authToken");
    return of(!!authToken);
  }

  logout() {
    localStorage.clear();
    this._router.navigate(["/auth/login"]);
  }
}
