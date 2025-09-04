export interface MedicineDTO {
  idMedicine: number;
  idCompany: number;
  commercialName: string;
  activeIngredient: string;
  pharmaceuticalForm: string;
  concentration: string;
  presentation: string;
  unitOfMeasure: string;
  currentStock: number;
  minimumStock: number;
  unitPrice: number;
  batch: string;
  expirationDate: Date;
  supplier: string;
  isActive: boolean;
  registrationDate: Date;
  registeredByUser: number;
}
