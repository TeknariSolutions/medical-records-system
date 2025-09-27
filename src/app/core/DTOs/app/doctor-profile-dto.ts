export interface DoctorProfileDTO {
  idDoctorProfile: number;
  idUser: number;
  idSpeciality: number;
  medicalRegistre: string;
  digitalSignature: string;
  documentType: string;
  idDocument: string;
}
// doctor-profile-response.dto.ts
export interface DoctorProfileResponseDTO {
  idDoctorProfile: number;
  idUser: number;

  // Datos del usuario (solo lectura en UI)
  email: string;
  name: string;
  secondName: string;
  lastName: string;
  secondLastName: string;

  // Datos médicos (editables en el form)
  idSpeciality: number;
  specialityDescription: string;
  medicalRegistre: string;
  digitalSignature: string; // data:image/png;base64,...
  documentType: string;
  idDocument: string;
}
