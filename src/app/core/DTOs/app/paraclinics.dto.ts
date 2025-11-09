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
  idConsultationFinality?: number; // Finalidad de la consulta
  groupServiceCode?: string; // Código del grupo de servicios
  idCieCode?: number; // Código CIE10,

  cupsName?: string;
  idCIECode?: number;
  codigo?: string;
  nombre?: string;
}
