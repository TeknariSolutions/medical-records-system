import { Observable } from 'rxjs';
import { ResponseDTO } from '../../DTOs/common/response/response.dto';
import { PrescriptionDetailDTO } from '../../DTOs/app/prescription-details.dto';

export interface IPrescriptionDetailsService {
    CreatePrescriptionDetails(prescriptionDetail: PrescriptionDetailDTO): Observable<ResponseDTO>;
    UpdatePrescriptionDetails(prescriptionDetail: PrescriptionDetailDTO): Observable<ResponseDTO>;
    GetPrescriptionDetailsByIdPrescription(idPrescription?: number): Observable<ResponseDTO>;
}