import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
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

@Component({
  selector: 'app-medical-consultation',
  templateUrl: './medical-consultation.component.html',
  styleUrl: './medical-consultation.component.scss',
  standalone: true,
  imports: [
    CommonModule,
    LoadingComponent,
    CreateUpdateMedicalConsultationComponent,
    PaginationComponent
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

  constructor(
    private router: Router,
    private _medicalConsultationUseCase: MedicalConsultationUseCase,
    private _notificationService: NotificationsService,
    private modalService: BsModalService,
    private _dataTransferService: DataTransferService
  ) { }

  ngOnInit(): void {
    if (this.idPatient) {
      console.log(this.idPatient)

      this.loadConsults();
    }
  }

  loadConsults() {
    this.isLoading = true;

    const paginatorDTO: PaginatorDTO = {
      pageIndex: this.currentPage,
      pageSize: this.pageSize,
    };

    this._medicalConsultationUseCase.GetListMedicalConsultationByIdPatient(paginatorDTO, this.idPatient).subscribe({
      next: (data: TableResultDTO) => {
        this.consults = data.results;
        this.totalRecords = data.totalRecords;
        this.isLoading = false;

        console.log(this.consults)
      }
    });
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

/*   onEditConsultation(consultation: MedicalConsultationDTO) {
    if (consultation.status === true) {
      this._notificationService.showErrorMessage(
        'No es posible editar una consulta cerrada.'
      );
      return;
    }

    // ✅ Si está abierta, permitir edición
    this.selectedConsultation = consultation;
    this.showForm = true;
  }
 */

  onPageChange(newPage: number): void {
    this.currentPage = newPage;
    this.loadConsults();
  }

  onPageSizeChange(newSize: number): void {
    this.pageSize = newSize;
    this.currentPage = 1; // reinicia a la primera página
    this.loadConsults();
  }


  viewDetailsMedicalConsultation(data: MedicalConsultationDTO): void {
    const initialState = {
      idPatient: data.idPatient,
      idMedicalConsultation: data.idMedicalConsultation,
      patientData: this.patientData // 👈 le pasas la info completa del paciente
    };

    this.modalRef = this.modalService.show(DetailsConsultationComponent, {
      class: 'modal-lg',
      initialState
    });
  }


  viewMedicalConsultationProcedures(consultation: MedicalConsultationDTO): void {
    // Guardar la consulta
    this._dataTransferService.setData(consultation);
    sessionStorage.setItem('consultationData', JSON.stringify(consultation));

    // Guardar también el paciente
    if (this.patientData) {
      sessionStorage.setItem('patientData', JSON.stringify(this.patientData));
    }

    // ✅ Guardar flag para que al volver se abran las consultas
    sessionStorage.setItem('pp_showConsultations', 'true');

    this.router.navigate(['parametrization/consultation-procedures']);
  }





}
