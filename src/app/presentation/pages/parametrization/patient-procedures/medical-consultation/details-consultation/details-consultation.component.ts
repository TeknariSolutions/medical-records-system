import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import html2pdf from 'html2pdf.js';
import { DoctorProfileResponseDTO } from 'src/app/core/DTOs/app/doctor-profile-dto';
import { MedicalConsultationDTO } from 'src/app/core/DTOs/app/medical-consultation.dto';
import { MedicalDiagnosisDTO } from 'src/app/core/DTOs/app/medical-diagnosis.dto';
import { PatientDTO } from 'src/app/core/DTOs/app/patient.dto';
import { TableResultDTO } from 'src/app/core/DTOs/common/table-result/table-result.dto';
import { DoctorProfileUseCase } from 'src/app/infrastructure/use-cases/app/doctor-profile-use-case';
import { MedicalConsultationUseCase } from 'src/app/infrastructure/use-cases/app/medical-consultation.use-case';

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'app-details-consultation',
  templateUrl: './details-consultation.component.html',
  styleUrl: './details-consultation.component.scss'
})
export class DetailsConsultationComponent {

  @Input() idPatient!: number;
  @Input() idMedicalConsultation!: number;
  @Input() patientData!: PatientDTO;


  dataConsultation!: MedicalConsultationDTO | null;
  diagnoses: MedicalDiagnosisDTO[] = [];

  doctorProfile: DoctorProfileResponseDTO | null = null;


  constructor(private _medicalConsultationUseCase: MedicalConsultationUseCase,
    private _doctorProfileUseCase: DoctorProfileUseCase
  ) {

  }

  ngOnInit(): void {
    this.loadDataConsultation();
  }

  printConsultation() {
    const element = document.getElementById('consultation-content');
    if (!element) return;

    const opt = {
      //margin: 0,
      margin: [25, 15, 25, 15], // arriba, derecha, abajo, izquierda
      filename: 'historia-clinica.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, scrollY: 0 },
      jsPDF: { unit: 'pt', format: 'letter', orientation: 'portrait' }
    };

    html2pdf().from(element).set(opt).save();
  }


  loadDataConsultation() {
    this._medicalConsultationUseCase.GetMedicalConsultationById(this.idMedicalConsultation).subscribe({
      next: (data) => {
        this.dataConsultation = data.main.length > 0 ? data.main[0] : null;
        this.diagnoses = data.related;

        if (this.dataConsultation?.idUser) {
          this._doctorProfileUseCase.GetDoctorProfileById(this.dataConsultation.idUser).subscribe({
            next: (res) => {
              this.doctorProfile = res?.data || null;
            }
          });
        }
      }
    });
  }


  get hasDiagnosisWithComment(): boolean {
    return this.diagnoses?.some(d => !!d.comment) ?? false;
  }

  getAgeFromBirthDay(birthDay: string): number {
    if (!birthDay) return 0;
    const today = new Date();
    const birthDate = new Date(birthDay);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }


}
