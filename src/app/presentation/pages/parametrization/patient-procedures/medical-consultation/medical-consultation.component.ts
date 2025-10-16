import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MedicalConsultationDTO } from 'src/app/core/DTOs/app/medical-consultation.dto';
import { PaginatorDTO } from 'src/app/core/DTOs/common/paginator/paginator.dto';
import { TableResultDTO } from 'src/app/core/DTOs/common/table-result/table-result.dto';
import { NotificationsService } from 'src/app/infrastructure/services/common/notifications/notifications.service';
import { MedicalConsultationUseCase } from 'src/app/infrastructure/use-cases/app/medical-consultation.use-case';
import { LoadingComponent } from 'src/app/presentation/common/loading/loading.component';
import { CreateUpdateMedicalConsultationComponent } from './create-update-medical-consultation/create-update-medical-consultation.component';
import { PaginationComponent } from 'src/app/presentation/common/pagination/pagination.component';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { DetailsConsultationComponent } from './details-consultation/details-consultation.component';
import { PatientDTO } from 'src/app/core/DTOs/app/patient.dto';
import { DataTransferService } from 'src/app/infrastructure/services/common/data-transfer/data-transfer.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DoctorProfileUseCase } from 'src/app/infrastructure/use-cases/app/doctor-profile-use-case';
import { MedicalHistoryUseCase } from 'src/app/infrastructure/use-cases/app/medical-history.use-case';

@Component({
  selector: 'app-medical-consultation',
  templateUrl: './medical-consultation.component.html',
  styleUrl: './medical-consultation.component.scss',
  standalone: true,
  imports: [
    CommonModule,
    LoadingComponent,
    CreateUpdateMedicalConsultationComponent,
    PaginationComponent,
    FormsModule,
    ReactiveFormsModule,
  ]
})
export class MedicalConsultationComponent implements OnInit {

  @Input() idPatient!: number;
  @Output() createNewConsultation = new EventEmitter<void>();

  @Input() patientData!: PatientDTO;

  consults: MedicalConsultationDTO[] = [];
  isLoading: boolean = false;

  currentPage: number = 1;
  pageSize: number = 10;
  pageSizeOptions = [5, 10, 25, 100];
  totalRecords: number = 0;

  showForm: boolean = false;

  modalRef?: BsModalRef;

  //filterStatus?: boolean;
  filterStatus: boolean | '' = '';

  filterConsultationDate: string = '';

  @ViewChild(DetailsConsultationComponent) detailsComponent!: DetailsConsultationComponent;

  constructor(
    private router: Router,
    private _medicalConsultationUseCase: MedicalConsultationUseCase,
    private _doctorProfileUseCase: DoctorProfileUseCase,
    private _notificationService: NotificationsService,
    private _medicalHistoryUseCase: MedicalHistoryUseCase ,
    private modalService: BsModalService,
    private _dataTransferService: DataTransferService
  ) { }

  ngOnInit(): void {
    if (this.idPatient) {
      this.loadConsults();
    }
    
  }

  loadConsults() {
    this.isLoading = true;

    const paginatorDTO: PaginatorDTO = {
      pageIndex: this.currentPage,
      pageSize: this.pageSize,
    };

    // Pasamos valores solo si existen
    const statusToSend = typeof this.filterStatus === 'boolean' ? this.filterStatus : undefined;
    const dateToSend = this.filterConsultationDate ? this.filterConsultationDate : undefined;

    this._medicalConsultationUseCase
      .GetListMedicalConsultationByIdPatient(paginatorDTO, this.idPatient, statusToSend, dateToSend)
      .subscribe({
        next: (data: TableResultDTO) => {
          this.consults = data.results;
          this.totalRecords = data.totalRecords;
          this.isLoading = false;
        },
        error: () => { this.isLoading = false; }
      });
  }


  applyFilter(): void {
    this.currentPage = 1; // reset paginación
    this.loadConsults();
  }

  clearFilter(): void {
    this.filterStatus = '';
    this.filterConsultationDate = '';
    this.currentPage = 1; // opcional: reiniciar paginación
    this.loadConsults();
  }


  onNewConsultationClick() {
    this.selectedConsultation = undefined;
    this.showForm = true;
    this.createNewConsultation.emit();
  }

  onBackToList() {
    this.showForm = false;
    this.loadConsults(); // Opcional: recargar si se acaba de crear algo
  }

  selectedConsultation?: MedicalConsultationDTO;

  onEditConsultation(consultation: MedicalConsultationDTO) {
    this.selectedConsultation = consultation;
    this.showForm = true;
  }

  onPageChange(newPage: number): void {
    this.currentPage = newPage;
    this.loadConsults();
  }

  onPageSizeChange(newSize: number): void {
    this.pageSize = newSize;
    this.currentPage = 1; // reinicia a la primera página
    this.loadConsults();
  }


 /*  viewDetailsMedicalConsultation(data: MedicalConsultationDTO): void {
    const initialState = {
      idPatient: data.idPatient,
      idMedicalConsultation: data.idMedicalConsultation,
      patientData: this.patientData // le pasas la info completa del paciente
    };

    this.modalRef = this.modalService.show(DetailsConsultationComponent, {
      class: 'modal-lg',
      initialState
    });
  } */

  /* viewDetailsMedicalConsultation(data: MedicalConsultationDTO): void {
    const initialState = {
      idPatient: data.idPatient,
      idMedicalConsultation: data.idMedicalConsultation,
      patientData: this.patientData
    };

    this.modalRef = this.modalService.show(DetailsConsultationComponent, {
      class: 'modal-lg',
      initialState
    });
  }

  onDownloadPDF(consultation: MedicalConsultationDTO) {
    this.viewDetailsMedicalConsultation(consultation);
  } */
/* 
  onDownloadPDF(consultation: MedicalConsultationDTO) {
    const component = new DetailsConsultationComponent(
      this._medicalConsultationUseCase,
      this._doctorProfileUseCase
    );

    component.idPatient = consultation.idPatient;
    component.idMedicalConsultation = consultation.idMedicalConsultation;
    component.patientData = this.patientData;

    component.generatePDF();
  }
 */

  onDownloadPDF(consultation: MedicalConsultationDTO) {
    const component = new DetailsConsultationComponent(
      this._medicalConsultationUseCase,
      this._doctorProfileUseCase,
      this._notificationService,
      this._medicalHistoryUseCase,
    );

    component.idPatient = consultation.idPatient;
    component.idMedicalConsultation = consultation.idMedicalConsultation;
    component.patientData = this.patientData;

    component.generatePDF();
  }




/*   onDownloadPDF(consultation: MedicalConsultationDTO) {
    // Puedes asignar aquí los datos necesarios al hijo si es que no están cargados aún
    this.detailsComponent.dataConsultation = consultation;
    this.detailsComponent.generatePDF();
  } */


  viewMedicalConsultationProcedures(consultation: MedicalConsultationDTO): void {
    if (!consultation.idMedicalConsultation) {
      this._notificationService.showToastErrorMessage('No se encontró el ID de la consulta');
      return;
    }

    // ✅ guardamos el patientData con clave
    this._dataTransferService.setData('patientData', this.patientData);

    this.router.navigate([
      'parametrization/consultation-procedures',consultation.idMedicalConsultation]);
  }

}
