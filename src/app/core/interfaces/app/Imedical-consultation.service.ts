import { Observable } from 'rxjs';
import { ResponseDTO } from '../../DTOs/common/response/response.dto';
import { PaginatorDTO } from '../../DTOs/common/paginator/paginator.dto';
import { MedicalConsultationDTO } from '../../DTOs/app/medical-consultation.dto';

export interface IMedicalConsultationService {
    CreateMedicalConsultation(medicalConsultation: MedicalConsultationDTO): Observable<ResponseDTO>;
    UpdateMedicalConsultation(medicalConsultation: MedicalConsultationDTO): Observable<ResponseDTO>;
    GetListMedicalConsultationByIdPatient(paginator: PaginatorDTO, idPatient?: number, Status?: boolean, ConsultationDate?: string): Observable<ResponseDTO>
    CreateMedicalConsultationWithMedicalDiagnosis(medicalDiagnosis: MedicalConsultationDTO): Observable<ResponseDTO>;
    GetMedicalConsultationById(IdMedicalConsultation?: number): Observable<ResponseDTO>;
    GetListMedicalConsultationByStatus(paginator: PaginatorDTO, idDocument: string, firstName: string, lastName: string ): Observable<ResponseDTO>;
}