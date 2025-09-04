import { Injectable } from '@angular/core';
import { Observable, switchMap, map } from 'rxjs';
import { ResponseDTO } from 'src/app/core/DTOs/common/response/response.dto';
import { HttpService } from '../../http-services/http-service.service';
import { ConfigService } from '../config/config.service';

@Injectable({
  providedIn: 'root'
})
export class IcdAuthService {

  constructor(
    private _httpService: HttpService,
    private _configService: ConfigService
  ) { }

  getToken(): Observable<string | undefined> {
    return this._configService.getUrl().pipe(
      switchMap(url => 
        this._httpService.get<ResponseDTO>(url, "GetTokenICD")
      ),
      map(response => response.data?.access_token)
    );
  }
}
