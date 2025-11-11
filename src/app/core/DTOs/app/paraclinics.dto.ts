export interface ParaclinicsDTO {
  idParaclinics?: number;
  idPatient: number;
  name: string;
  datePerformen: string;
  file?: File;
  observations?: string;

  idCupsCode?: number;
  idModalityAttention?: number;
  isExternal?: boolean;
  codViaIngreso?: string;

  registeredByUserID?: number;
  registeredAt?: string;
  updateByUserID?: number;
  updatedAt?: string;

  imagePath?: string;
  urlFile?: string;

  idUser?: number; // Médico tratante
  idConsultationFinality?: number; 
  groupServiceCode?: string; 
  idCieCode?: number; 

  cupsName?: string;
  idCIECode?: number;
  codigo?: string;
  nombre?: string;
}
