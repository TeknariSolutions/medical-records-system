import { MedicalConsultationDTO } from "./medical-consultation.dto";
import { MedicalDiagnosisDTO } from "./medical-diagnosis.dto";

export interface MedicalConsultationByIdDTO {
  main: MedicalConsultationDTO[];
  related: MedicalDiagnosisDTO[];
}