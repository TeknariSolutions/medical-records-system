import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { take } from 'rxjs';
import { PatientDTO } from 'src/app/core/DTOs/app/patient.dto';
import { DataTransferService } from 'src/app/infrastructure/services/common/data-transfer/data-transfer.service';
import { MedicalConsultationComponent } from './medical-consultation/medical-consultation.component';
import { Eps, EpsColombiaService } from 'src/app/infrastructure/services/common/EPS-Colombia/eps-colombia.service';

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

  // EPS
  epsList: any[] = [];

  constructor(
    private _dataTransferService: DataTransferService,
    private _epsService: EpsColombiaService,
    private _router: Router
  ) { }


  ngOnInit(): void {
    this.loadEPS();

    this._dataTransferService.getData$()
      .pipe(take(1))
      .subscribe((data: any) => {
        // Heurística mínima para distinguir PatientDTO de una consulta
        const looksLikePatient =
          data &&
          (typeof data.firstName === 'string' || typeof data.idEps !== 'undefined' || typeof data.idDocument !== 'undefined');

        if (looksLikePatient) {
          this.patientData = data as PatientDTO;
          // ✅ Guarda/actualiza copia estable
          sessionStorage.setItem('patientData', JSON.stringify(this.patientData));
        } else {
          // ✅ Fallback confiable
          const saved = sessionStorage.getItem('patientData');
          if (saved) {
            this.patientData = JSON.parse(saved) as PatientDTO;
          } else {
            // Si aún así no hay nada, intenta que el DataTransferService cargue de storage
            this._dataTransferService.loadFromStorage();
            const saved2 = sessionStorage.getItem('patientData');
            if (saved2) {
              this.patientData = JSON.parse(saved2) as PatientDTO;
            }
          }
        }

        console.log('patientData en PatientProcedures:', this.patientData);

        // ✅ Revisa el flag
        const flag = sessionStorage.getItem('pp_showConsultations');
        if (flag === 'true') {
          this.showConsultations = true;

          // (Opcional) Limpia el flag para que no quede pegado
          sessionStorage.removeItem('pp_showConsultations');
        }

      });
  }


  loadEPS(): void {
  this._epsService.getEpsList().subscribe(data => {
    this.epsList = data;
  });
}

  getEpsName(idEps: number): string {
    return this.epsList.find(e => e.idEps === idEps)?.nombre || 'N/A';
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

goBackToPatients(): void {
  this._router.navigate(['/parametrization/patients']);
}


}
