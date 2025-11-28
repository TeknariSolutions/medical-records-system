import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NotificationsService } from 'src/app/infrastructure/services/common/notifications/notifications.service';
import { LoadingComponent } from 'src/app/presentation/common/loading/loading.component';
import { PaginationComponent } from 'src/app/presentation/common/pagination/pagination.component';
import { PaginatorDTO } from 'src/app/core/DTOs/common/paginator/paginator.dto';
import { TableResultDTO } from 'src/app/core/DTOs/common/table-result/table-result.dto';
import { MedicalConsultationDTO } from 'src/app/core/DTOs/app/medical-consultation.dto';
import { DatePipe } from '@angular/common';
import { CreateUpdateMedicalConsultationComponent } from '../patient-procedures/medical-consultation/create-update-medical-consultation/create-update-medical-consultation.component';
import { MedicalConsultationUseCase } from 'src/app/infrastructure/use-cases/app/medical-consultation.use-case';
import { Router } from '@angular/router';

@Component({
  selector: 'app-schedule-patients',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    LoadingComponent,
    PaginationComponent,
    CreateUpdateMedicalConsultationComponent,
    DatePipe
  ],
  templateUrl: './schedule-patients.component.html',
  styleUrl: './schedule-patients.component.scss'
})
export class SchedulePatientsComponent implements OnInit {

  consultations: MedicalConsultationDTO[] = [];
  isLoading: boolean = false;

  // Estado del formulario
  showForm: boolean = false;
  selectedConsultation?: MedicalConsultationDTO;

  // Paginación
  currentPage: number = 1;
  pageSize: number = 10;
  totalRecords: number = 0;
  pageSizeOptions = [5, 10, 25, 50];

  constructor(
    private router: Router,
    private _medicalConsultationUseCase: MedicalConsultationUseCase,
    private _notificationService: NotificationsService
  ) {}

  ngOnInit(): void {
    this.loadConsultations();
  }

  loadConsultations(): void {
    this.isLoading = true;

    const paginator: PaginatorDTO = {
      pageIndex: this.currentPage,
      pageSize: this.pageSize
    };

    this._medicalConsultationUseCase.GetListMedicalConsultationByStatus(paginator).subscribe({
      next: (data: TableResultDTO) => {
        this.consultations = data.results || [];
        this.totalRecords = data.totalRecords || 0;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('❌ Error al cargar las consultas:', err);
        this._notificationService.showToastErrorMessage('Error al cargar las consultas.');
        this.isLoading = false;
      }
    });
  }


  onEditConsultation(consultation: MedicalConsultationDTO): void {
    this.selectedConsultation = consultation;
    this.showForm = true;
  }


  onBackToList(): void {
    this.showForm = false;
    this.selectedConsultation = undefined;
    this.loadConsultations();
  }


  onPageChange(newPage: number): void {
    this.currentPage = newPage;
    this.loadConsultations();
  }

  onPageSizeChange(newSize: number): void {
    this.pageSize = newSize;
    this.currentPage = 1;
    this.loadConsultations();
  }

  goBackToPatients(): void {
      this.router.navigate([`/parametrization/patients`]);
  }
}
