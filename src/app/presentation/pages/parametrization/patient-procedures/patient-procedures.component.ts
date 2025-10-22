import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { take } from 'rxjs';
import { PatientDTO } from 'src/app/core/DTOs/app/patient.dto';
import { DataTransferService } from 'src/app/infrastructure/services/common/data-transfer/data-transfer.service';
import { MedicalConsultationComponent } from './medical-consultation/medical-consultation.component';
//import { Eps, EpsColombiaService } from 'src/app/infrastructure/services/common/EPS/eps-colombia.service';
import { PatientsUseCase } from 'src/app/infrastructure/use-cases/app/patients.use-case';
import { EpsUseCase } from 'src/app/infrastructure/use-cases/common/eps.use-case';

@Component({
  selector: 'app-patient-procedures',
  templateUrl: './patient-procedures.component.html',
  styleUrl: './patient-procedures.component.scss',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MedicalConsultationComponent
  ]
})
export class PatientProceduresComponent implements OnInit {

  patientData?: PatientDTO;

  showConsultations = false;

  showCreateConsultation = false;

  constructor(
    private _dataTransferService: DataTransferService,
    private _patientsUseCase: PatientsUseCase,
    //private _epsService: EpsColombiaService,
    private _epsUseCase: EpsUseCase,
    private _router: Router,
    private _route: ActivatedRoute
  ) { }

  ngOnInit(): void {
   
    // Traer idPatient desde la ruta
    const idPatient = Number(this._route.snapshot.paramMap.get('idPatient'));

    if (idPatient) {
      this._patientsUseCase.GetPatientByIdAll(idPatient).subscribe({
        next: (patient) => {
          this.patientData = patient as PatientDTO;
        },
        error: (err) => {
          console.error('Error al obtener el paciente', err);
        }
      });
    }
  }


  getAgeFromBirthDay(birthDay: string): number {
    const today = new Date();
    const birthDate = new Date(birthDay);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }

  navigateToMedicalHistoryList(): void {
    if (this.patientData?.idPatient) {
      this._router.navigate(['parametrization/medical-history-list', this.patientData.idPatient]);
    } else {
      console.error('No se encontró patientData.idPatient');
    }
  }

   navigateToParaclinicsList(): void {
    if (this.patientData?.idPatient) {
      this._router.navigate(['parametrization/paraclinics', this.patientData.idPatient]);
    } else {
      console.error('No se encontró patientData.idPatient');
    }
  }

  goBackToPatients(): void {
    this._router.navigate(['/parametrization/patients']);
  }

}
