import { Observable } from 'rxjs';
import { ResponseDTO } from '../../DTOs/common/response/response.dto';
import { PrescriptionDTO } from '../../DTOs/app/prescription.dto';

export interface IPrescriptionsService {
    CreatePrescription(prescription: PrescriptionDTO): Observable<ResponseDTO>;
    GetListPrescriptions(idMedicalConsultation?: number): Observable<ResponseDTO>;
}