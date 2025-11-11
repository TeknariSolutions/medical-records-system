export interface MedicalEquipmentDTO {
  idMedicalEquipment: number;
  equipmentName: string;
  description: string;
  brand: string;
  currentStock: number;
  minimumStock: number;
  unitPrice: number;
  supplier: string;
  acquisitionDate: string; 
  expirationDate: string; 
  isActive: boolean;
  registrationDate: string;
  registeredByUser?: number;
  idCompany: number;
}
