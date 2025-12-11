import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { take } from 'rxjs';
import { MedicalConsultationDTO } from 'src/app/core/DTOs/app/medical-consultation.dto';
import { MedicalDiagnosisDTO } from 'src/app/core/DTOs/app/medical-diagnosis.dto';
import { DataTransferService } from 'src/app/infrastructure/services/common/data-transfer/data-transfer.service';
import { MedicalConsultationDiagnosisUseCase } from 'src/app/infrastructure/use-cases/app/medical-consultation-diagnosis.use-case';
import { PrescriptionsComponent } from './prescriptions/prescriptions.component';
import { OrdersComponent } from './orders/orders.component';
import { MedicalConsultationUseCase } from 'src/app/infrastructure/use-cases/app/medical-consultation.use-case';
import { PatientDTO } from 'src/app/core/DTOs/app/patient.dto';
import { NotificationsService } from 'src/app/infrastructure/services/common/notifications/notifications.service';
import { MedicalConsultationByIdDTO } from 'src/app/core/DTOs/app/medical-consultation-by-id.dto';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    PrescriptionsComponent,
    OrdersComponent
  ],
  selector: 'app-consultation-procedures',
  templateUrl: './consultation-procedures.component.html',
  styleUrl: './consultation-procedures.component.scss'
})
export class ConsultationProceduresComponent implements OnInit {

  consultationData?: MedicalConsultationDTO;
  //consultationData: Partial<MedicalConsultationDTO> = {};


  diagnoses: MedicalDiagnosisDTO[] = [];

  showPrescriptions = false;
  showOrders = false;

  showCreateConsultation = false;

  patientData!: PatientDTO;

  constructor(
    private _dataTransferService: DataTransferService,
    private _router: Router,
    private _route: ActivatedRoute,
    private _medicalConsultationDiagnosisUseCase: MedicalConsultationDiagnosisUseCase,
    private _medicalConsultationUseCase: MedicalConsultationUseCase,
    private _notificationService: NotificationsService
  ) { }


 ngOnInit(): void {

  

  this.patientData = this._dataTransferService.getData<PatientDTO>('patientData')!;

  //console.log('PATIENT DATA:', this.patientData)

  const idConsultation = Number(this._route.snapshot.paramMap.get('idMedicalConsultation'));

  if (!idConsultation) {
    this._notificationService.showToastErrorMessage('ID de consulta no válido');
    this._router.navigate(['/parametrization/patients']);
    return;
  }

   this._medicalConsultationUseCase.GetMedicalConsultationById(idConsultation)
     .subscribe({
       /* next: (response: MedicalConsultationByIdDTO) => {
         if (response) {
           this.consultationData = response.main?.[0];
           this.diagnoses = response.related ?? [];
         }
       }
        */

       next: (response: MedicalConsultationByIdDTO) => {
         if (response) {
           this.consultationData = {
             ...response.main?.[0],
             idMedicalConsultation: idConsultation, // 👈 IMPORTANTE
             idPatient: response.main?.[0]?.idPatient ?? this.patientData?.idPatient,
             idUser: Number(localStorage.getItem('IdUser'))
           };

           //console.log(this.consultationData)

           this.diagnoses = response.related ?? [];
         }
       }

       ,
       error: () => {
         this._notificationService.showToastErrorMessage(
           'Error al cargar la consulta desde el servidor'
         );
       }
     });
}

  goBackToProcedures(): void {
    const idPatient = this.patientData?.idPatient ?? this.consultationData?.idPatient;

    if (idPatient) {
      this._router.navigate([`/parametrization/patient-procedures`, idPatient]);
    } else {
      this._notificationService.showToastErrorMessage(
        'No se pudo determinar el paciente ❌'
      );
    }
  }


  loadDiagnosisConsultation() {
    this._medicalConsultationDiagnosisUseCase
      .GetListMedicalConsultationDiagnosisByIdMedicalConsultation(this.consultationData.idMedicalConsultation)
      .subscribe((diagnoses: MedicalDiagnosisDTO[]) => {
        this.diagnoses = diagnoses;
      });
  }


  get hasDiagnosisWithComment(): boolean {
    return this.diagnoses?.some(d => !!d.comment) ?? false;
  }

  openPrescriptions(): void {
    this.showPrescriptions = true;
    this.showOrders = false;
  }

  openOrders(): void {
    this.showOrders = true;
    this.showPrescriptions = false;
  }

  goHome(): void {
    this.showPrescriptions = false;
    this.showOrders = false;
  }

}
