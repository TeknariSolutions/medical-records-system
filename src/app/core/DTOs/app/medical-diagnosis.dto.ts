export interface MedicalDiagnosisDTO {
  diagnosisCode: string;
  diagnosisDescription: string;
  diagnosisType: string;
  isPrincipal: boolean;
  comment: string;
  createdBy: number;
}
