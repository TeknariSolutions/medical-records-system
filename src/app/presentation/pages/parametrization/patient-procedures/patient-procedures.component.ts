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

/*   ngOnInit(): void {

    this._dataTransferService.getData$()
          .pipe(take(1))
          .subscribe(patient => {
            if (patient) {
              this.patientData = patient;
    
              console.log(this.patientData);

            }
      });

  } */

  ngOnInit(): void {
     this.loadEPS();

    this._dataTransferService.getData$()
      .pipe(take(1))
      .subscribe(patient => {
        if (patient) {
          this.patientData = patient;
        } else {
          // Intentar cargar desde sessionStorage
          this._dataTransferService.loadFromStorage();
          const saved = sessionStorage.getItem('patientData');
          if (saved) {
            this.patientData = JSON.parse(saved);
          }
        }
        console.log(this.patientData);
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









}
