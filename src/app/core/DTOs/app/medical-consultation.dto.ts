import { MedicalDiagnosisDTO } from "./medical-diagnosis.dto";

export interface MedicalConsultationDTO {
  idMedicalConsultation: number;
  idPatient: number;
  idUser: number;
  consultationDate: Date;
  consultationReason: string;
  vitalSigns_BP: string;
  vitalSigns_HR: number;
  vitalSigns_RR: number;
  vitalSigns_Temp: number;
  vitalSigns_SPO2: number;
  physicalExam_HeadNeck: string;
  physicalExam_Chest: string;
  physicalExam_Heart: string;
  physicalExam_Abdomen: string;
  physicalExam_GU: string;
  physicalExam_Musculoskeletal: string;
  physicalExam_Neuro: string;
  physicalExam_Skin: string;
  observations: string;
  status: string;
  createdBy: number;
  isFirstTime: boolean;
  diagnoses?: MedicalDiagnosisDTO[];
}