export interface MedicalEquipmentDTO {
  idMedicalEquipment: number;
  equipmentName: string;
  description: string;
  brand: string;
  currentStock: number;
  minimumStock: number;
  unitPrice: number;
  supplier: string;
  acquisitionDate: string;  // ISO 8601
  expirationDate: string;   // ISO 8601
  isActive: boolean;
  registrationDate: string; // ISO 8601
  registeredByUser: number;
  idCompany: number;
}
