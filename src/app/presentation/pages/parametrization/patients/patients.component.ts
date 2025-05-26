import { NgClass } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PatientDTO } from 'src/app/core/DTOs/app/patient.dto';
import { PaginatorDTO } from 'src/app/core/DTOs/common/paginator/paginator.dto';
import { TableResultDTO } from 'src/app/core/DTOs/common/table-result/table-result.dto';
import { NotificationsService } from 'src/app/infrastructure/services/common/notifications/notifications.service';
import { PatientsUseCase } from 'src/app/infrastructure/use-cases/app/patients.use-case';
import { LoadingComponent } from 'src/app/presentation/common/loading/loading.component';

@Component({
  standalone: true,
  imports: [
    NgClass,
    LoadingComponent
  ],
  selector: 'app-patients',
  templateUrl: './patients.component.html',
  styleUrl: './patients.component.css'
})
export class PatientsComponent implements OnInit {

  patients: PatientDTO[] = [];
  isLoading: boolean = false;

  constructor(
    private router: Router,
    private _patientsUseCase: PatientsUseCase,
    private _notificationService: NotificationsService
   ) {}

   ngOnInit(): void {
    this.loadPatients();
  }

   loadPatients() {
    this.isLoading = true;
    const paginator: PaginatorDTO = {
      pageIndex: 1,
      pageSize: 1000
    };

    this._patientsUseCase.GetListPatients(paginator, '').subscribe({
      next: (data: TableResultDTO) => {
        this.patients = data.results;
        console.log(this.patients)
        this.isLoading = false;
      }
    });
  }

  createPatient() {
    this.router.navigate(['parametrization/create-update-patient']);
  }

  deletePatient(idPatient: number): void {
    this._notificationService.confirm('¿Estás seguro de eliminar este registro?', 'Esta acción no se puede deshacer.').then(confirmed => {
        if (confirmed) {
          this.isLoading = true;
          this._patientsUseCase.DeletePatient(idPatient).subscribe({
            next: () => {
              this.loadPatients();
              this.isLoading = false;
            },
            error: () => {
              this.isLoading = false;
            }
          });
        }
      });
  }



}
