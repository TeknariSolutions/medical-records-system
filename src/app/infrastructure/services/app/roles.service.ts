import { Injectable } from '@angular/core';
import { HttpService } from '../http-services/http-service.service';
import { ConfigService } from '../common/config/config.service';
import { ResponseDTO } from 'src/app/core/DTOs/common/response/response.dto';
import { Observable, switchMap } from 'rxjs';
import { PaginatorDTO } from 'src/app/core/DTOs/common/paginator/paginator.dto';
import { IRolesService } from 'src/app/core/interfaces/app/iroles.service';

@Injectable({
  providedIn: 'root'
})
export class RolesService implements IRolesService  {

  constructor(
    private _httpService: HttpService,
    private _configService: ConfigService
  ) { }

  GetListRoles(paginator: PaginatorDTO, description?: string): Observable<ResponseDTO> {
    return this._configService.getUrl().pipe(
      switchMap(url => {
        let params: any = {
          PageIndex: paginator.pageIndex,
          PageSize: paginator.pageSize,
          description
        };
        return this._httpService.get<ResponseDTO>(url, "api/Roles/GetListRoles", params);
      })
    );
  }
}
