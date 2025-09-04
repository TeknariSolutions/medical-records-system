export interface OrderDetailsDTO {
    idOrderDetail: number;
    idOrder: number;
    idCupsCode: number;
    procedureDescription: string;
    quantity: number;
    instructions: string;
    registeredByUser: number;
    registeredAt: Date;
    updatedByUserId: number;
    updatedAt: Date;
}