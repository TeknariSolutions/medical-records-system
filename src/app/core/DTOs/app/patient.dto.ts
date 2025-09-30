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
  epsName?: string;
  ethnic: string;
  stratum: string;
  regime: string;
  idCompany: number;
  countryId: number;
  departmentId: number;
  municipalityId: number;
  codRegimen: number;
  job: string;
  bloodType: string;
  maritalStatus: string;
  createdBy: number;

  createdAt: string;
  updatedBy: number,
  updatedAt: string;
  nameOfGuardian: string;
  idDocumentGuardian: string;
  documentTypeGuradian: string;
  relationship: string;
  addressOfGuardian: string;
  phoneNumberOfGuardian: string;
  emailOfGuardian: string;
  registerDate?: string;
  municipalityName?: string;
  countryName?: string;
}





