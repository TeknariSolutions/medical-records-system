export interface PrescriptionDTO {
    idPrescription: number;
    idMedicalConsultation: number;
    idPatient: number;
    idUser: number;
    prescriptionDate: string;
    isActive: boolean;
}