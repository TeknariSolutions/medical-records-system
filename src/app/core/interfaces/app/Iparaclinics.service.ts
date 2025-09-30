import { Observable } from 'rxjs';
import { ResponseDTO } from '../../DTOs/common/response/response.dto';
import { PaginatorDTO } from '../../DTOs/common/paginator/paginator.dto';
import { ParaclinicsDTO } from '../../DTOs/app/paraclinics.dto';

export interface IParaclinicsService {
    CreateParaclinics(paraclinics: ParaclinicsDTO): Observable<ResponseDTO>;
    UpdateParaclinics(paraclinics: ParaclinicsDTO): Observable<ResponseDTO>;
    GetListParaclinic(paginator: PaginatorDTO, idPatient?: number): Observable<ResponseDTO>;
}