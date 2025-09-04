export interface PrescriptionDetailDTO {
    idPrescriptionDetail: number;
    idPrescription: number;
    idMedicine: number;
    dosage: string;
    frequency: string;
    duration: string;
    prescribedQuantity: number;
    instructions: string;
    updatedByUserId: number;
    updatedAt: string; // ISO date string
    registeredByUser: number;
    registeredAt: string; // ISO date string
}
