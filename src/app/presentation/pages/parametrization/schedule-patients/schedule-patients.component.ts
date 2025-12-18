import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
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
import { DoctorProfileUseCase } from 'src/app/infrastructure/use-cases/app/doctor-profile-use-case';
import { MedicalHistoryUseCase } from 'src/app/infrastructure/use-cases/app/medical-history.use-case';
import { CloseConsultationUseCase } from 'src/app/infrastructure/use-cases/app/close-consultation.use-case';
import { DataTransferService } from 'src/app/infrastructure/services/common/data-transfer/data-transfer.service';
import { DetailsConsultationComponent } from '../patient-procedures/medical-consultation/details-consultation/details-consultation.component';
import { PatientDTO } from 'src/app/core/DTOs/app/patient.dto';
import { PatientsUseCase } from 'src/app/infrastructure/use-cases/app/patients.use-case';

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

  filterIdDocument: string = '';
  filterFirstName: string = '';
  filterFirstLastName: string = '';

  @ViewChild(DetailsConsultationComponent) detailsComponent!: DetailsConsultationComponent;

  constructor(
    private router: Router,
    private _medicalConsultationUseCase: MedicalConsultationUseCase,
    private _notificationService: NotificationsService,
    private _doctorProfileUseCase: DoctorProfileUseCase,
    private _medicalHistoryUseCase: MedicalHistoryUseCase,
    private _closeConsultationUseCase: CloseConsultationUseCase,
    private _dataTransferService: DataTransferService,
    private _patientsUseCase: PatientsUseCase,
  ) { }

  ngOnInit(): void {
    this.loadConsultations();
  }

  loadConsultations(): void {
    this.isLoading = true;

    const paginator: PaginatorDTO = {
      pageIndex: this.currentPage,
      pageSize: this.pageSize
    };

    this._medicalConsultationUseCase.GetListMedicalConsultationByStatus(
      paginator,
      this.filterIdDocument,
      this.filterFirstName,
      this.filterFirstLastName
    ).subscribe({
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

  applyFilter(): void {
    this.currentPage = 1; // reset paginación al aplicar filtro
    this.loadConsultations();
  }

  clearFilter(): void {
    this.filterIdDocument = '';
    this.filterFirstName = '';
    this.filterFirstLastName = '';
    this.loadConsultations();
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

  onEnterKey(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.currentPage = 1;
      this.loadConsultations();
    }
  }

  onDownloadPDF(consultation: MedicalConsultationDTO): void {

    if (!consultation.idPatient || !consultation.idMedicalConsultation) {
      this._notificationService.showToastErrorMessage('Datos incompletos para generar PDF');
      return;
    }

    this.isLoading = true;

    this._patientsUseCase
      .GetPatientByIdAll(consultation.idPatient)
      .subscribe({
        next: (patient: PatientDTO) => {

          const component = new DetailsConsultationComponent(
            this._medicalConsultationUseCase,
            this._doctorProfileUseCase,
            this._notificationService,
            this._medicalHistoryUseCase,
            this._closeConsultationUseCase
          );

          component.idPatient = consultation.idPatient!;
          component.idMedicalConsultation = consultation.idMedicalConsultation!;
          component.patientData = patient;

          component.generatePDF();
          this.isLoading = false;
        },
        error: () => {
          this._notificationService.showToastErrorMessage('Error al obtener el paciente');
          this.isLoading = false;
        }
      });
  }


  viewMedicalConsultationProcedures(consultation: MedicalConsultationDTO): void {

    if (!consultation.idMedicalConsultation || !consultation.idPatient) {
      this._notificationService.showToastErrorMessage('Datos incompletos');
      return;
    }

    this.isLoading = true;

    this._patientsUseCase.GetPatientByIdAll(consultation.idPatient).subscribe({
      next: (patient: PatientDTO) => {

        this._dataTransferService.setData('patientData', patient);

        this.router.navigate([
          'parametrization/consultation-procedures',
          consultation.idMedicalConsultation
        ]);

        this.isLoading = false;
      },
      error: () => {
        this._notificationService.showToastErrorMessage('Error al obtener datos del paciente');
        this.isLoading = false;
      }
    });
  }

}
