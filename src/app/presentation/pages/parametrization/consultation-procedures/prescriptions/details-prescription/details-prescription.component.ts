import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import html2pdf from 'html2pdf.js';
import { PrescriptionDTO } from 'src/app/core/DTOs/app/prescription.dto';
import { PrescriptionDetailDTO } from 'src/app/core/DTOs/app/prescription-details.dto';
import { PatientDTO } from 'src/app/core/DTOs/app/patient.dto';
import { MedicalConsultationDTO } from 'src/app/core/DTOs/app/medical-consultation.dto';
import { PrescriptionDetailsUseCase } from 'src/app/infrastructure/use-cases/app/prescription-details.use-case';
import { DoctorProfileUseCase } from 'src/app/infrastructure/use-cases/app/doctor-profile-use-case';
import { DoctorProfileResponseDTO } from 'src/app/core/DTOs/app/doctor-profile-dto';
import { PatientsUseCase } from 'src/app/infrastructure/use-cases/app/patients.use-case';

@Component({
  selector: 'app-details-prescription',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './details-prescription.component.html',
  styleUrl: './details-prescription.component.scss'
})
export class DetailsPrescriptionComponent implements OnInit {

  @Input() idPatient!: number;
  @Input() idMedicalConsultation!: number;
  //@Input() patientData!: PatientDTO;
  patientData!: PatientDTO;
  @Input() prescriptionData!: PrescriptionDTO;

  details: PrescriptionDetailDTO[] = [];
  doctorProfile: DoctorProfileResponseDTO | null = null;

  constructor(private _prescriptionDetailsUseCase: PrescriptionDetailsUseCase,
    private _doctorProfileUseCase: DoctorProfileUseCase,
    private _patientsUseCase: PatientsUseCase
  ) {}

  ngOnInit(): void {

    if (this.idPatient) {
      this.loadPatient(this.idPatient);
    }

    if (this.prescriptionData?.idPrescription) {
      this.loadPrescriptionDetails(this.prescriptionData.idPrescription);
    }

    if (this.prescriptionData?.idUser) {
      this.loadDoctorProfile(this.prescriptionData.idUser);
    }
  }

  loadPatient(idPatient: number): void {
    this._patientsUseCase.GetPatientByIdAll(idPatient).subscribe({
      next: (data) => {
        this.patientData = data;
      },
      error: () => {
        console.error('Error cargando datos del paciente');
      }
    });
  }


  loadPrescriptionDetails(idPrescription: number): void {
    this._prescriptionDetailsUseCase
      .GetPrescriptionDetailsByIdPrescription(idPrescription)
      .subscribe((data: PrescriptionDetailDTO[]) => {
        this.details = data;
      });
  }

  loadDoctorProfile(idUser: number): void {
    this._doctorProfileUseCase.GetDoctorProfileById(idUser).subscribe({
      next: (res) => {
        this.doctorProfile = res?.data || null;
      }
    });
  }

  printPrescription(): void {
    const element = document.getElementById('prescription-content');
    if (!element) return;

    const opt = {
      margin: [20, 15, 20, 15],
      filename: 'prescripcion-medica.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, scrollY: 0 },
      jsPDF: { unit: 'pt', format: 'letter', orientation: 'portrait' }
    };

    html2pdf().from(element).set(opt).save();
  }
}
