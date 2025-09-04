export interface PrescriptionDTO {
    idPrescription: number;
    idMedicalConsultation: number;
    idPatient: number;
    idUser: number;
    prescriptionDate: Date;
    generalObservations: string;
    isActive: boolean;
}