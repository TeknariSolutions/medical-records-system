import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { take } from 'rxjs';
import { PatientDTO } from 'src/app/core/DTOs/app/patient.dto';
import { DataTransferService } from 'src/app/infrastructure/services/common/data-transfer/data-transfer.service';
import { MedicalConsultationComponent } from './medical-consultation/medical-consultation.component';

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
    private _dataTransferService: DataTransferService
  ) { }

  ngOnInit(): void {

    this._dataTransferService.getData$()
          .pipe(take(1))
          .subscribe(patient => {
            if (patient) {
              this.patientData = patient;
    
              console.log(this.patientData);

            }
      });

  }




}
