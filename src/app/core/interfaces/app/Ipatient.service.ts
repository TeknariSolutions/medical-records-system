import { Observable } from 'rxjs';
import { ResponseDTO } from '../../DTOs/common/response/response.dto';
import { PaginatorDTO } from '../../DTOs/common/paginator/paginator.dto';
import { PatientDTO } from '../../DTOs/app/patient.dto';

export interface IPatientService {
    CreatePatient(patient: PatientDTO): Observable<ResponseDTO>;
    UpdatePatient(patient: PatientDTO): Observable<ResponseDTO>;
    DeletePatient(idPatient: number): Observable<ResponseDTO>;
    GetListPatients(paginator: PaginatorDTO, IdDocument?: string, FirstName?: string, FirstLastName?: string): Observable<ResponseDTO>;
    GetPatientByIdAll(idPatient: number): Observable<ResponseDTO>;
}