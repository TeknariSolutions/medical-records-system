export interface OrderDTO {
    idOrder: number;
    idMedicalConsultation: number;
    idPatient: number;
    orderDate: string;
    generalObservations: string;
    isActive: boolean;
    idUser: number;
}