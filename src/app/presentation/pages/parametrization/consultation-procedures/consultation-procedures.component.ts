import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { take } from 'rxjs';
import { MedicalConsultationDTO } from 'src/app/core/DTOs/app/medical-consultation.dto';
import { MedicalDiagnosisDTO } from 'src/app/core/DTOs/app/medical-diagnosis.dto';
import { DataTransferService } from 'src/app/infrastructure/services/common/data-transfer/data-transfer.service';
import { MedicalConsultationDiagnosisUseCase } from 'src/app/infrastructure/use-cases/app/medical-consultation-diagnosis.use-case';
import { PrescriptionsComponent } from './prescriptions/prescriptions.component';
import { OrdersComponent } from './orders/orders.component';

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

  diagnoses: MedicalDiagnosisDTO[] = [];

  showPrescriptions = false;
  showOrders = false;

  showCreateConsultation = false;

  constructor(
    private _dataTransferService: DataTransferService,
    private _router: Router,
    private _medicalConsultationDiagnosisUseCase: MedicalConsultationDiagnosisUseCase,
  ) { }


  ngOnInit(): void {
    this._dataTransferService.getData$()
      .pipe(take(1))
      .subscribe(consultation => {
        if (consultation) {
          this.consultationData = consultation;
        } else {
          this._dataTransferService.loadFromStorage();
          const saved = sessionStorage.getItem('consultationData');
          if (saved) {
            this.consultationData = JSON.parse(saved);
          }
        }

        if (this.consultationData) {
          this.loadDiagnosisConsultation(); // 👈 mover aquí
        }
      });
  }



  goBackToProcedures(): void {
    // Recuperar los datos del paciente que ya guardaste en sessionStorage
    const savedPatient = sessionStorage.getItem('patientData');

    if (savedPatient) {
      // 🔹 Volver al listado de consultas
      this._router.navigate(['/parametrization/patient-procedures']);
    } else {
      // fallback si no hay nada guardado
      this._router.navigate(['/parametrization/patients']);
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
