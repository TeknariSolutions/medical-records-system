export interface ParaclinicsDTO {
    idParaclinics?: number;
    idPatient: number;
    name: string;
    datePerformen: string;
    file?: File;
    observations?: string;
    registeredByUserID?: number;
    registeredAt?: string;
    updateByUserID?: number;
    updatedAt?: string;

    imagePath?: string;
    urlFile?: string;
}