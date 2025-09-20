import { Injectable } from "@angular/core";
import { map, Observable, of } from "rxjs";
import { PatientsService } from "../../services/app/patients.service";
import { NotificationsService } from "../../services/common/notifications/notifications.service";
import { PatientDTO } from "src/app/core/DTOs/app/patient.dto";
import { ResponseDTO } from "src/app/core/DTOs/common/response/response.dto";
import { PaginatorDTO } from "src/app/core/DTOs/common/paginator/paginator.dto";
import { TableResultDTO } from "src/app/core/DTOs/common/table-result/table-result.dto";
import { MedicinesService } from "../../services/app/medicines.service";
import { MedicineDTO } from "src/app/core/DTOs/app/medicine.dto";

@Injectable({
    providedIn: "root",
})

export class MedicineUseCase {
    constructor(private _medicinesService: MedicinesService,
        private _notificationService: NotificationsService
    ) { }

    CreateMedicine(medicine: MedicineDTO): Observable<boolean> {
        return this._medicinesService.CreateMedicine(medicine).pipe(
            map((response: ResponseDTO) => {
                if (!response.isSuccess) {
                    this._notificationService.showToastErrorMessage(response.message!);
                } else {
                    this._notificationService.showToastSuccessMessage(response.message!);
                }
                return response.data;
            })
        );
    }

    UpdateMedicine(medicine: MedicineDTO): Observable<boolean> {
        return this._medicinesService.UpdateMedicine(medicine).pipe(
            map((response: ResponseDTO) => {
                if (!response.isSuccess) {
                    this._notificationService.showToastErrorMessage(response.message!);
                } else {
                    this._notificationService.showToastSuccessMessage(response.message!);
                }
                return response.data;
            })
        );
    }

    DeleteMedicine(idMedicine: number): Observable<boolean> {
        return this._medicinesService.DeleteMedicine(idMedicine).pipe(
            map((response: ResponseDTO) => {
                if (!response.isSuccess) {
                    this._notificationService.showToastErrorMessage(response.message!);
                } else {
                    this._notificationService.showToastSuccessMessage(response.message!);
                }
                return response.data;
            })
        );
    }


    GetListMedicines(paginator: PaginatorDTO, ActiveIngredient?: string, CommercialName?: string): Observable<TableResultDTO> {
        const idCompany = Number(localStorage.getItem('IdCompany')) || 0;

        return this._medicinesService.GetListMedicine(paginator, idCompany, ActiveIngredient, CommercialName).pipe(
            map((response: ResponseDTO) => {
                if (!response.isSuccess) {
                    this._notificationService.showToastErrorMessage(response.message!);
                }
                return response.data;
            })
        );
    }


    GetMedicineById(IdMedicine: number): Observable<any> {
        return this._medicinesService.GetMedicineById(IdMedicine).pipe(
            map((response: ResponseDTO) => {
                if (!response.isSuccess) {
                    this._notificationService.showToastErrorMessage(response.message!);
                }
                return response.data;
            })
        );
    }





}