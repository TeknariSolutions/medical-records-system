import { Observable } from 'rxjs';
import { ResponseDTO } from '../../DTOs/common/response/response.dto';
import { PaginatorDTO } from '../../DTOs/common/paginator/paginator.dto';

export interface ICountriesService {
    GetListCountries(paginator: PaginatorDTO, CountryCode?: number, CountryName?: string, ISO2?: string, ISO3?: string): Observable<ResponseDTO>;
    GetListDepartments(paginator: PaginatorDTO, Name?: string, IdCountry?: number): Observable<ResponseDTO>;
    GetListMunicipalities(paginator: PaginatorDTO, Code?: string, Name?: string, IdDepartment?: number): Observable<ResponseDTO>;
}