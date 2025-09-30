import { Injectable } from "@angular/core";
import { map, Observable, of } from "rxjs";
import { NotificationsService } from "../../services/common/notifications/notifications.service";
import { PatientDTO } from "src/app/core/DTOs/app/patient.dto";
import { ResponseDTO } from "src/app/core/DTOs/common/response/response.dto";
import { PaginatorDTO } from "src/app/core/DTOs/common/paginator/paginator.dto";
import { TableResultDTO } from "src/app/core/DTOs/common/table-result/table-result.dto";
import { ParaclinicsService } from "../../services/app/paraclinics.service";
import { ParaclinicsDTO } from "src/app/core/DTOs/app/paraclinics.dto";

@Injectable({
  providedIn: "root",
})
export class ParaclinicsUseCase {
  constructor(
    private _paraclinicsService: ParaclinicsService,
    private _notificationService: NotificationsService
  ) {}

  CreateParaclinics(paraclinics: ParaclinicsDTO, file?: File): Observable<boolean> {
    return this._paraclinicsService.CreateParaclinics(paraclinics, file).pipe(
      map((response: ResponseDTO) => {
        if (!response.isSuccess) {
          this._notificationService.showToastErrorMessage(response.message!);
          return false;
        } else {
          this._notificationService.showToastSuccessMessage(response.message!);
          return true;
        }
      })
    );
  }

  UpdateParaclinics(paraclinics: ParaclinicsDTO): Observable<boolean> {
    return this._paraclinicsService.UpdateParaclinics(paraclinics).pipe(
      map((response: ResponseDTO) => {
        if (!response.isSuccess) {
          this._notificationService.showToastErrorMessage(response.message!);
          return false;
        } else {
          this._notificationService.showToastSuccessMessage(response.message!);
          return true;
        }
      })
    );
  }

  GetListParaclinic(paginator: PaginatorDTO, idPatient?: number): Observable<TableResultDTO> {
    return this._paraclinicsService.GetListParaclinic(paginator, idPatient).pipe(
      map((response: ResponseDTO) => {
        if (!response.isSuccess) {
          this._notificationService.showToastErrorMessage(response.message!);
        }
        return response.data;
      })
    );
  }
}
