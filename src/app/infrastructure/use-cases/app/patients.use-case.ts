import { Injectable } from "@angular/core";
import { map, Observable, of } from "rxjs";
import { PatientsService } from "../../services/app/patients.service";
import { NotificationsService } from "../../services/common/notifications/notifications.service";
import { PatientDTO } from "src/app/core/DTOs/app/patient.dto";
import { ResponseDTO } from "src/app/core/DTOs/common/response/response.dto";
import { PaginatorDTO } from "src/app/core/DTOs/common/paginator/paginator.dto";
import { TableResultDTO } from "src/app/core/DTOs/common/table-result/table-result.dto";

@Injectable({
  providedIn: "root",
})

export class PatientsUseCase {
  constructor(private _patientsService: PatientsService,
    private _notificationService: NotificationsService
  ) {}

  CreatePatient(patient: PatientDTO): Observable<boolean> {
    return this._patientsService.CreatePatient(patient).pipe(
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

  UpdatePatient(patient: PatientDTO): Observable<boolean> {
    return this._patientsService.UpdatePatient(patient).pipe(
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

   DeletePatient(idPatient: number): Observable<boolean> {
    return this._patientsService.DeletePatient(idPatient).pipe(
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

  GetListPatients(paginator: PaginatorDTO, Filter?: string):Observable<TableResultDTO> {
    return this._patientsService.GetListPatients(paginator, Filter).pipe(
      map((response: ResponseDTO) => {
        if (!response.isSuccess) {
          this._notificationService.showToastErrorMessage(response.message!);
        } 
        return response.data;
      })
    );
  }

}