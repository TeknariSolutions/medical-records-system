import { Observable } from 'rxjs';
import { ResponseDTO } from '../../DTOs/common/response/response.dto';
import { PaginatorDTO } from '../../DTOs/common/paginator/paginator.dto';
import { MedicalHistoryDTO } from '../../DTOs/app/medical-history.dto';

export interface IMedicalHistoryService {
    CreateMedicalHistory(medicalHistory: MedicalHistoryDTO): Observable<ResponseDTO>;
    UpdateMedicalHistory(medicalHistory: MedicalHistoryDTO): Observable<ResponseDTO>;
    GetListMedicalHistoryPatient(paginator: PaginatorDTO, idPatient?: number): Observable<ResponseDTO>;
    GetLastMedicalHistory(idPatient?: number): Observable<ResponseDTO>;
}