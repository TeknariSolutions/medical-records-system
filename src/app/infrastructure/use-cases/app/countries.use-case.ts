import { Injectable } from "@angular/core";
import { map, Observable, of } from "rxjs";
import { NotificationsService } from "../../services/common/notifications/notifications.service";
import { ResponseDTO } from "src/app/core/DTOs/common/response/response.dto";
import { PaginatorDTO } from "src/app/core/DTOs/common/paginator/paginator.dto";
import { CountriesService } from "../../services/app/countries.service";
import { TableResultDTO } from "src/app/core/DTOs/common/table-result/table-result.dto";

@Injectable({
    providedIn: "root",
})

export class CountriesUseCase {

    constructor(private _countriesService: CountriesService,
        private _notificationService: NotificationsService
    ) { }

    GetListCountries(paginator: PaginatorDTO, CountryCode?: number, CountryName?: string, ISO2?: string, ISO3?: string): Observable<TableResultDTO> {
        return this._countriesService.GetListCountries(paginator, CountryCode, CountryName, ISO2, ISO3).pipe(
            map((response: ResponseDTO) => {
                if (!response.isSuccess) {
                    this._notificationService.showToastErrorMessage(response.message!);
                }
                return response.data;
            })
        );
    }

    GetListDepartments(paginator: PaginatorDTO, Name?: string, IdCountry?: number): Observable<TableResultDTO> {
        return this._countriesService.GetListDepartments(paginator, Name, IdCountry).pipe(
            map((response: ResponseDTO) => {
                if (!response.isSuccess) {
                    this._notificationService.showToastErrorMessage(response.message!);
                }
                return response.data;
            })
        );
    }

    GetListMunicipalities(paginator: PaginatorDTO, Code?: string, Name?: string, IdDepartment?: number): Observable<TableResultDTO> {
        return this._countriesService.GetListMunicipalities(paginator, Code, Name, IdDepartment).pipe(
            map((response: ResponseDTO) => {
                if (!response.isSuccess) {
                    this._notificationService.showToastErrorMessage(response.message!);
                }
                return response.data;
            })
        );
    }


}