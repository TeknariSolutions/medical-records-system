import { MedicalDiagnosisDTO } from "./medical-diagnosis.dto";

export interface MedicalConsultationDTO {
  idMedicalConsultation: number;
  idPatient: number;
  idUser: number;
  consultationDate: string;
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
  status: boolean;
  createdBy: number;
  createdAt: string;

  isFirstTime: boolean;
  diagnoses?: MedicalDiagnosisDTO[];

  updateBy: number;
  updateAt: string;

  glasgowScore: number;
  consciousnessStatus: string;
  hydrationStatus: string;
  respiratoryStatus: string;
  generalStatus: string;
  weightKg: number;
  heightCm: string;
  bmi: number;

  currentIllness: string;
  paraClinicalTest : string;
  idConsultationFinality: number;
  idExitCondition: number;
  idExternalCauseCode: number;
  externalCauseName?: string;

  analysisOrConcept: string;
  treatment: string;

  idCupsCode: number;
  idMedicalServices: number;
  idModalityAttention: number;
  groupServiceCode: string;

  paraclinicalResults: string;
}