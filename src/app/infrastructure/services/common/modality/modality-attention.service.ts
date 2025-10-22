import { Injectable } from '@angular/core';
import { HttpService } from '../../http-services/http-service.service';
import { ConfigService } from '../config/config.service';
import { Observable, switchMap } from 'rxjs';
import { ResponseDTO } from 'src/app/core/DTOs/common/response/response.dto';

@Injectable({
  providedIn: 'root'
})
export class ModalityAttentionService {

  constructor(
    private _httpService: HttpService,
    private _configService: ConfigService
  ) { }


  GetListModalityAttention(): Observable<ResponseDTO> {
    return this._configService.getUrl().pipe(
      switchMap(url => {
        return this._httpService.get<ResponseDTO>(url, "GetListModalityAttention");
      })
    );
  }

}
