import { Injectable } from '@angular/core';
import { HttpService } from '../http-services/http-service.service';
import { ConfigService } from '../common/config/config.service';
import { Observable, switchMap } from 'rxjs';
import { ResponseDTO } from 'src/app/core/DTOs/common/response/response.dto';
import { PaginatorDTO } from 'src/app/core/DTOs/common/paginator/paginator.dto';

@Injectable({
  providedIn: 'root'
})
export class SpecialitiesService {

  constructor(
    private _httpService: HttpService,
    private _configService: ConfigService
  ) { }

  GetListSpecialities(paginator: PaginatorDTO, description?: string): Observable<ResponseDTO> {
    return this._configService.getUrl().pipe(
      switchMap(url => {
        let params: any = {
          PageIndex: paginator.pageIndex,
          PageSize: paginator.pageSize,
          description
        };
        return this._httpService.get<ResponseDTO>(url, "GetListSpecialities", params);
      })
    );
  }
}
