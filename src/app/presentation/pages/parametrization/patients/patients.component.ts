import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { PatientDTO } from 'src/app/core/DTOs/app/patient.dto';
import { PaginatorDTO } from 'src/app/core/DTOs/common/paginator/paginator.dto';
import { TableResultDTO } from 'src/app/core/DTOs/common/table-result/table-result.dto';
import { DataTransferService } from 'src/app/infrastructure/services/common/data-transfer/data-transfer.service';
import { NotificationsService } from 'src/app/infrastructure/services/common/notifications/notifications.service';
import { PatientsUseCase } from 'src/app/infrastructure/use-cases/app/patients.use-case';
import { LoadingComponent } from 'src/app/presentation/common/loading/loading.component';
import { PaginationComponent } from 'src/app/presentation/common/pagination/pagination.component';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    LoadingComponent,
    PaginationComponent,
    BsDropdownModule
  ],
  selector: 'app-patients',
  templateUrl: './patients.component.html',
  styleUrl: './patients.component.css'
})
export class PatientsComponent implements OnInit {

  patients: PatientDTO[] = [];
  isLoading: boolean = false;

  currentPage: number = 1;
  pageSize: number = 10; 
  pageSizeOptions = [5, 10, 25, 100]; 
  totalRecords: number = 0;

  constructor(
    private router: Router,
    private _patientsUseCase: PatientsUseCase,
    private _notificationService: NotificationsService,
    private _dataTransferService: DataTransferService
  ) { }

  ngOnInit(): void {
    this.loadPatients();
  }

  loadPatients() {
    this.isLoading = true;

    const paginatorDTO: PaginatorDTO = {
      pageIndex: this.currentPage,
      pageSize: this.pageSize,
    };

    this._patientsUseCase.GetListPatients(paginatorDTO, '').subscribe({
      next: (data: TableResultDTO) => {
        this.patients = data.results;
        this.totalRecords = data.totalRecords;
        this.isLoading = false;
      }
    });
  }

  createPatient() {
    this.router.navigate(['parametrization/create-update-patient']);
  }

  editPatient(patient: any): void {
    this._dataTransferService.setData(patient);
    this.router.navigate(['parametrization/create-update-patient']);
  }

  viewPatientProcedures(patient: any): void {
    this._dataTransferService.setData(patient);
    this.router.navigate(['parametrization/patient-procedures']);
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

  onPageChange(newPage: number): void {
    this.currentPage = newPage;
    this.loadPatients();
  }

  onPageSizeChange(newSize: number): void {
    this.pageSize = newSize;
    this.currentPage = 1; // reinicia a la primera página
    this.loadPatients();
  }



}
