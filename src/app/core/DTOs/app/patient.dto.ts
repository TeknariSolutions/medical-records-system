export interface PatientDTO {
  idPatient: number;
  firstName: string;
  secondName: string;
  firstLastName: string;
  secondLastName: string;
  documentType: string;
  idDocument: string;
  birthDay: string; // formato ISO (ej. "2025-05-26T00:42:47.047Z")
  sex: string;
  isDisAbility: boolean;
  disAbilityDescription: string;
  address: string;
  phoneNumber: string;
  phoneNumber2: string;
  email: string;
  idEps: number;
  ethnic: string;
  stratum: string;
  regime: string;
  idCompany: number;
  residenceDepartment: string;
  city: string;
  job: string;
  bloodType: string;
  maritalStatus: string;
  createdBy: number;
}
