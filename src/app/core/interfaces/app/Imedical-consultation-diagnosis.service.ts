import { Observable } from 'rxjs';
import { ResponseDTO } from '../../DTOs/common/response/response.dto';
import { MedicalDiagnosisDTO } from '../../DTOs/app/medical-diagnosis.dto';

export interface IMedicalConsultationDiagnosisService {
    CreateMedicalConsultationDiagnosis(medicalConsultationDiagnosis: MedicalDiagnosisDTO): Observable<ResponseDTO>;
}