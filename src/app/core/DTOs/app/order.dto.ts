export interface OrderDTO {
    idOrder: number;
    idMedicalConsultation: number;
    idPatient: number;
    orderDate: Date;
    generalObservations: string;
    isActive: boolean;
    idUser: number;
}