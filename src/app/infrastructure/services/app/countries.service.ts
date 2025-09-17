import { Injectable } from '@angular/core';
import { HttpService } from '../http-services/http-service.service';
import { ConfigService } from '../common/config/config.service';
import { ResponseDTO } from 'src/app/core/DTOs/common/response/response.dto';
import { Observable, switchMap } from 'rxjs';
import { PaginatorDTO } from 'src/app/core/DTOs/common/paginator/paginator.dto';
import { ICountriesService } from 'src/app/core/interfaces/app/Icountries.service';

@Injectable({
  providedIn: 'root'
})
export class CountriesService implements ICountriesService {

  constructor(
    private _httpService: HttpService,
    private _configService: ConfigService
  ) { }


  /* GetListCountries(paginator: PaginatorDTO, CountryCode?: number, CountryName?: string, ISO2?: string, ISO3?: string): Observable<ResponseDTO> {
    return this._configService.getUrl().pipe(
      switchMap(url => {
        let params: any = {
          PageIndex: paginator.pageIndex,
          PageSize: paginator.pageSize,
          CountryCode,
          CountryName,
          ISO2,
          ISO3
        };
        return this._httpService.get<ResponseDTO>(url, "GetListCountries", params);
      })
    );
  } */

  GetListCountries(paginator: PaginatorDTO, CountryCode?: number, CountryName?: string, ISO2?: string, ISO3?: string): Observable<ResponseDTO> {
    return this._configService.getUrl().pipe(
      switchMap(url => {
        // payload base con paginador
        const params: any = {
          PageIndex: paginator.pageIndex,
          PageSize: paginator.pageSize
        };

        // agregar filtros solo si vienen definidos
        if (CountryCode !== undefined) params.CountryCode = CountryCode;
        if (CountryName) params.CountryName = CountryName;
        if (ISO2) params.ISO2 = ISO2;
        if (ISO3) params.ISO3 = ISO3;

        return this._httpService.get<ResponseDTO>(url, "GetListCountries", params);
      })
    );
  }




  /*   GetListDepartments(paginator: PaginatorDTO, Code?: string, Name?: string): Observable<ResponseDTO> {
      return this._configService.getUrl().pipe( 
        switchMap(url => {
          let params: any = {
            PageIndex: paginator.pageIndex,
            PageSize: paginator.pageSize,
            Code,
            Name
          };
          return this._httpService.get<ResponseDTO>(url, "GetListDepartments", params);
        })
      );
    } */

  GetListDepartments(paginator: PaginatorDTO, Name?: string, IdCountry?: number): Observable<ResponseDTO> {
    return this._configService.getUrl().pipe(
      switchMap(url => {
        // payload base con paginador
        const params: any = {
          PageIndex: paginator.pageIndex,
          PageSize: paginator.pageSize,
          IdCountry: IdCountry
        };

        // agregar filtros solo si vienen definidos
        if (Name) params.Name = Name;
        return this._httpService.get<ResponseDTO>(url, "GetListDepartments", params);
      })
    );
  }



  GetListMunicipalities(paginator: PaginatorDTO, Code?: string, Name?: string, IdDepartment?: number): Observable<ResponseDTO> {
    return this._configService.getUrl().pipe(
      switchMap(url => {
        let params: any = {
          PageIndex: paginator.pageIndex,
          PageSize: paginator.pageSize,
          IdDepartment
        };
        //return this._httpService.get<ResponseDTO>(url, "GetListMunicipalities", params);

        // agregar filtros solo si vienen definidos
        if (Code) params.Code = Code;
        if (Name) params.Name = Name;
        return this._httpService.get<ResponseDTO>(url, "GetListMunicipalities", params);
      })

    );
  }


}
