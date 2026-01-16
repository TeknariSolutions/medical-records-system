import { CommonModule } from '@angular/common';
import { Component, Input, Output, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { MedicalConsultationDTO } from 'src/app/core/DTOs/app/medical-consultation.dto';
import { PrescriptionDTO } from 'src/app/core/DTOs/app/prescription.dto';
import { TableResultDTO } from 'src/app/core/DTOs/common/table-result/table-result.dto';
import { PrescriptionsUseCase } from 'src/app/infrastructure/use-cases/app/prescriptions.use-case';
import { LoadingComponent } from 'src/app/presentation/common/loading/loading.component';
import { CreateUpdatePrescriptionComponent } from './create-update-prescription/create-update-prescription.component';
import { ResponseDTO } from 'src/app/core/DTOs/common/response/response.dto';
import { DetailsPrescriptionComponent } from './details-prescription/details-prescription.component';
import { PatientDTO } from 'src/app/core/DTOs/app/patient.dto';
import { PrescriptionDetailsUseCase } from 'src/app/infrastructure/use-cases/app/prescription-details.use-case';
import { DoctorProfileUseCase } from 'src/app/infrastructure/use-cases/app/doctor-profile-use-case';
import { PatientsUseCase } from 'src/app/infrastructure/use-cases/app/patients.use-case';
import { NotificationsService } from 'src/app/infrastructure/services/common/notifications/notifications.service';

@Component({
  selector: 'app-prescriptions',
  standalone: true,
  imports: [
    CommonModule,
    LoadingComponent
  ],
  templateUrl: './prescriptions.component.html',
  styleUrl: './prescriptions.component.css'
})
export class PrescriptionsComponent {

  @Input() idMedicalConsultation!: number;
  @Input() consultationData!: MedicalConsultationDTO;
  @Input() patientData!: PatientDTO;

  prescriptions: PrescriptionDTO[] = [];

  isLoading: boolean = false;

  modalRef?: BsModalRef;

  @ViewChild(DetailsPrescriptionComponent) detailsComponent!: DetailsPrescriptionComponent;

  idRol: number = 0; 

  constructor(private router: Router,
    private modalService: BsModalService,
    private _prescriptionsUseCase: PrescriptionsUseCase,
    private _prescriptionDetailsUseCase: PrescriptionDetailsUseCase,
    private _doctorProfileUseCase: DoctorProfileUseCase,
    private _patientsUseCase: PatientsUseCase,
    private _notificationService: NotificationsService
  ) {
      this.idRol = Number(localStorage.getItem('IdRol')) || 0;
  }

  ngOnInit(): void {
    this.loadPrescriptions();
  }


  loadPrescriptions() {
    this.isLoading = true;


    this._prescriptionsUseCase.GetListPrescriptions(this.idMedicalConsultation).subscribe({
      next: (data: any) => {
        this.prescriptions = data;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }


  openPrescriptionModal(prescription?: PrescriptionDTO) {
    this.modalRef = this.modalService.show(CreateUpdatePrescriptionComponent, {
      class: 'modal-xl',
      initialState: {
        consultationData: this.consultationData,
        prescriptionToEdit: prescription
      }
    });

    this.modalRef.content.onClose.subscribe((result: any) => {
      if (result === 'refresh') {
        this.loadPrescriptions();
      }
    });
  }

  viewDetailsPrescription(prescription: PrescriptionDTO): void {
    const initialState = {
      idPatient: prescription.idPatient,
      idMedicalConsultation: prescription.idMedicalConsultation,
      patientData: this.patientData,
      prescriptionData: prescription
    };

    this.modalRef = this.modalService.show(DetailsPrescriptionComponent, {
      class: 'modal-lg',
      initialState
    });
  }

  onDownloadPDF(prescription: PrescriptionDTO) {
    const component = new DetailsPrescriptionComponent(
      this._prescriptionDetailsUseCase,
      this._doctorProfileUseCase,
      this._patientsUseCase,
      this._notificationService
    );

    component.idPatient = prescription.idPatient;
    component.idMedicalConsultation = prescription.idMedicalConsultation;
    component.prescriptionData = prescription;
    component.patientData = this.patientData;

    //console.log(prescription)

    //component.generatePDF();
    component.generateWord();

  }

  deletePrescription(idPrescription: number): void {
    this._notificationService.confirm('¿Estás seguro de eliminar este registro?', 'Esta acción no se puede deshacer.').then(confirmed => {
      if (confirmed) {
        this.isLoading = true;
        this._prescriptionsUseCase.DeletePrescriptionById(idPrescription).subscribe({
          next: () => {
            this.loadPrescriptions();
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
