export interface MedicalDiagnosisDTO {
  idMedicalConsultationDiagnosis: number;
  idMedicalConsultation: number;
  diagnosisCode: string;
  diagnosisDescription: string;
  diagnosisType: string;
  codeDiagnosisType: string;
  isPrincipal: boolean;
  comment: string;
  updatedBy: number;
  updatedAt: string;
  createdBy: number;
  createdAt: string;
}
