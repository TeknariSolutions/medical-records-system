export interface MedicalHistoryDTO {
  idMedicalHistory: number;
  idPatient: number;
  pathologicalHistory: string;
  surgicalHistory: string;
  allergicHistory: string;
  pharmacologicalHistory: string;
  familyHistory: string;
  gynecoObstetricHistory: string;
  occupationalHistory: string;
  psychiatricHistory: string;
  traumaticHistory: string;
  immunologicalHistory: string;
  observations: string;
  smoker: boolean;
  smokingYears: number;
  cigarettesPerDay: number;
  smokingIndex: number;
  alcoholConsumer: boolean;
  alcoholFrequency: string;
  drugUse: boolean;
  drugDetails: string;
  createdAt: Date;    // o Date si quieres tiparlo como Date
  createdBy: number;
  updatedAt: Date;    // o Date si quieres tiparlo como Date
  updatedBy: number;
  smokigDevice: string;
}
