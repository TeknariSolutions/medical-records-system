import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { MedicalConsultationDTO } from 'src/app/core/DTOs/app/medical-consultation.dto';
import { MedicalDiagnosisDTO } from 'src/app/core/DTOs/app/medical-diagnosis.dto';
import { PatientDTO } from 'src/app/core/DTOs/app/patient.dto';
import { DoctorProfileResponseDTO } from 'src/app/core/DTOs/app/doctor-profile-dto';

import { MedicalConsultationUseCase } from 'src/app/infrastructure/use-cases/app/medical-consultation.use-case';
import { DoctorProfileUseCase } from 'src/app/infrastructure/use-cases/app/doctor-profile-use-case';
import { NotificationsService } from 'src/app/infrastructure/services/common/notifications/notifications.service';

import pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { MedicalHistoryUseCase } from 'src/app/infrastructure/use-cases/app/medical-history.use-case';
import { MedicalHistoryDTO } from 'src/app/core/DTOs/app/medical-history.dto';
(pdfMake as any).vfs = (pdfFonts as any).vfs;

@Component({
  selector: 'app-details-consultation',
  standalone: true,
  imports: [CommonModule],
  template: '' 
})
export class DetailsConsultationComponent implements OnInit {
  @Input() idPatient!: number;
  @Input() idMedicalConsultation!: number;
  @Input() patientData!: PatientDTO;

  dataConsultation!: MedicalConsultationDTO | null;
  diagnoses: MedicalDiagnosisDTO[] = [];
  doctorProfile: DoctorProfileResponseDTO | null = null;
  medicalHistory: MedicalHistoryDTO | null = null;


  constructor(
    private _medicalConsultationUseCase: MedicalConsultationUseCase,
    private _doctorProfileUseCase: DoctorProfileUseCase,
    private _notificationService: NotificationsService,
    private _medicalHistoryUseCase: MedicalHistoryUseCase 
  ) {}

  ngOnInit(): void {
    this.generatePDF();
  }

  private async loadImageAsBase64(path: string): Promise<string> {
    try {
      const response = await fetch(path);
      const blob = await response.blob();
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      this._notificationService.showToastErrorMessage('No se pudo cargar el encabezado del PDF.');
      throw error;
    }
  }


  // Generación PDF
  // ===========================
    async generatePDF(): Promise<void> {
      try {
        this._notificationService.showInfoMessage('Generando documento, por favor espere...');

        await this.ensureDataLoaded();
        const logo = await this.loadImageAsBase64('assets/images/HEADER-HISTORIA3.png');

        const docDefinition = this.buildDocDefinition(logo);
        //pdfMake.createPdf(docDefinition).open();

        // ✅ Genera el nombre dinámicamente con el nombre del paciente y la fecha
          const fullName = `
          ${this.patientData.firstName ?? ''} 
          ${this.patientData.secondName ?? ''} 
          ${this.patientData.firstLastName ?? ''} 
          ${this.patientData.secondLastName ?? ''}
        `
          .replace(/\s+/g, ' ')          // limpia espacios múltiples
          .trim()                        // elimina espacios al inicio y fin
          .normalize('NFD')              // quita tildes
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/\W+/g, '_');         // reemplaza caracteres no válidos con _

        const filename = `Historia_Clinica_${fullName}_${this.formatDate(new Date())}.pdf`;
        pdfMake.createPdf(docDefinition).download(filename);


        this._notificationService.showSuccessMessage('Documento generado correctamente');
      } catch (error) {
        console.error('Error al generar el PDF:', error);
        this._notificationService.showToastErrorMessage('Ocurrió un error al generar el PDF.');
      }
    }

  // ===========================
  // Cargar datos de la consulta
  // ===========================
  private async ensureDataLoaded(): Promise<void> {
    if (!this.idMedicalConsultation) {
      //this._notificationService.showToastWarningMessage('No se encontró la información de la consulta.');
      return;
    }

    try {
      const consultaResp = await firstValueFrom(
        this._medicalConsultationUseCase.GetMedicalConsultationById(this.idMedicalConsultation)
      );

      this.dataConsultation = consultaResp.main.length > 0 ? consultaResp.main[0] : null;
      this.diagnoses = consultaResp.related ?? [];

      if (!this.dataConsultation) {
        //this._notificationService.showToastWarningMessage('No se encontró información clínica para esta consulta.');
      }

      if (this.dataConsultation?.idUser) {
        const doctorResp = await firstValueFrom(
          this._doctorProfileUseCase.GetDoctorProfileById(this.dataConsultation.idUser)
        );
        this.doctorProfile = doctorResp?.data ?? null;

        if (!this.doctorProfile) {
          //this._notificationService.showToastWarningMessage('No se encontró información del médico tratante.');
        }

        if (this.idPatient) {
          try {
            const history = await firstValueFrom(
              this._medicalHistoryUseCase.GetLastMedicalHistory(this.idPatient)
            );
            this.medicalHistory = history ?? null;
          } catch (error) {
            console.error('Error cargando antecedentes:', error);
            this.medicalHistory = null;
          }
        }

      } else {
        this.doctorProfile = null;
      }
    } catch (error) {
      console.error('Error cargando datos de la consulta:', error);
      this._notificationService.showToastErrorMessage('Error al cargar la información de la consulta.');
    }
  }

  private formatTime(date: string | Date): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleTimeString('es-CO', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }


  // ===========================
  // Definición del PDF
  // ===========================

  private buildDocDefinition(logoBase64: string) {
    return {
      pageSize: 'LETTER',
      // 👇 aumentamos el margen superior para todas las páginas
      pageMargins: [30, 110, 30, 30],

      header: {
        image: logoBase64,
        width: 575,
        height: 90,
        alignment: 'center',
        // 👇 este margen inferior agrega espacio adicional bajo el header
        margin: [20, 15, 0, 30]
      },

      footer: (currentPage: number, pageCount: number) => ({
        text: `${currentPage} / ${pageCount}`,
        alignment: 'right',
        margin: [0, 0, 40, 20],
        fontSize: 9
      }),

      content: [
        {
          stack: [
            {
              text: 'HISTORIA CLÍNICA',
              style: 'header',
              alignment: 'center',
              margin: [0, 0, 0, 5] // un poco menos de margen aquí
            },
            {
              text: [
                { text: 'Fecha de Ingreso: ', bold: true },
                { text: this.formatDate(this.patientData.registerDate) + '\n' },
                { text: 'Hora de Ingreso: ', bold: true },
                { text: this.formatTime(this.patientData.registerDate) }
              ],
              alignment: 'center',
              margin: [10, 10, 10, 30]
            }
          ]
        },

        this.buildPatientInfoTable(),

        { text: 'MOTIVO DE CONSULTA:', style: 'sectionHeader' },
        { text: this.nullAsNA(this.dataConsultation?.consultationReason), margin: [0, 5, 0, 15] },

        { text: 'ENFERMEDAD ACTUAL:', style: 'sectionHeader' },
        { text: this.nullAsNA(this.dataConsultation?.currentIllness), margin: [0, 5, 0, 15] },

        ...(this.medicalHistory ? [{ text: 'ANTECEDENTES:', style: 'sectionHeader' }, this.buildMedicalHistorySection()] : []),


        { text: 'ESTADO GENERAL:', style: 'sectionHeader' },
        this.buildGeneralStatusTable(),

        { text: 'SIGNOS VITALES:', style: 'sectionHeader' },
        this.buildVitalSignsTable(),

        { text: 'EXAMEN FISICO:', style: 'sectionHeader' },
        this.buildPhysicalExamTable(),

        { text: 'RESULTADOS PARACLINICOS:', style: 'sectionHeader' },
        { text: this.nullAsNA(this.dataConsultation?.paraClinicalTest), margin: [0, 5, 0, 15] },

        ...(this.diagnoses.length > 0
          ? [{ text: 'DIAGNÓSTICOS:', style: 'sectionHeader' }, this.buildDiagnosisTable()]
          : []),

        ...(this.doctorProfile ? [this.buildDoctorSignature()] : [])
      ],

      styles: {
        header: { fontSize: 11, bold: true },
        sectionHeader: { fontSize: 9.5, bold: true, margin: [0, 10, 0, 8] },
        tableHeader: { bold: true, fillColor: '#f2f2f2' }
      },
      defaultStyle: {
        fontSize: 9
      }
    };
  }

  // 👇 dentro de la clase DetailsConsultationComponent
  private tableLayout = {
    hLineWidth: (i: number, node: any) => {
      // Línea superior e inferior del mismo grosor
      return 0.5;
    },
   /*  vLineWidth: () => 0.5,
    hLineColor: () => '#aaa',
    vLineColor: () => '#aaa',
    paddingTop: () => 5,
    paddingBottom: () => 5 */
  };


  // ===========================
  // Secciones del PDF
  // ===========================
  /* private buildPatientInfoTable() {
    const fullName = `${this.patientData.firstName ?? ''} ${this.patientData.secondName ?? ''} ${this.patientData.firstLastName ?? ''} ${this.patientData.secondLastName ?? ''}`.replace(/\s+/g, ' ').trim();

    return {
      table: {
        widths: ['25%', '75%'],
        body: [
          [{ text: 'Paciente', style: 'tableHeader' }, fullName || 'N/A' ],
          [{ text: this.patientData.documentType || 'Documento', style: 'tableHeader' }, this.nullAsNA(this.patientData.idDocument)],
          [{ text: 'Edad', style: 'tableHeader' }, `${this.getAgeFromBirthDay(this.patientData.birthDay)} años`],
          [{ text: 'Dirección', style: 'tableHeader' }, this.nullAsNA(this.patientData.address)],
          [{ text: 'Teléfono', style: 'tableHeader' }, this.nullAsNA(this.patientData.phoneNumber)],
          [{ text: 'Ciudad', style: 'tableHeader' }, this.nullAsNA(this.patientData.municipalityName)],
          [{ text: 'EPS', style: 'tableHeader' }, this.nullAsNA(this.patientData.epsName)],
          [{ text: 'Regimen', style: 'tableHeader' }, this.nullAsNA(this.patientData.regime)],
        ]
      },
      layout: 'lightHorizontalLines',
      //layout: this.tableLayout,
      margin: [0, 0, 0, 15]
    };
  } 
 */

  private buildPatientInfoTable() {
    const fullName = `${this.patientData.firstName ?? ''} ${this.patientData.secondName ?? ''} ${this.patientData.firstLastName ?? ''} ${this.patientData.secondLastName ?? ''}`.replace(/\s+/g, ' ').trim();

    return {
      table: {
        widths: ['15%', '45%', '15%', '25%'],
        body: [
          [
            { text: 'Paciente', style: 'tableHeader' },
            fullName || 'N/A',
            { text: this.patientData.documentType || 'Documento', style: 'tableHeader' },
            this.nullAsNA(this.patientData.idDocument)
          ],
          [
            { text: 'Edad', style: 'tableHeader' },
            `${this.getAgeFromBirthDay(this.patientData.birthDay)} años`,
            { text: 'Estado civil', style: 'tableHeader' },
            this.nullAsNA(this.patientData.maritalStatus)
          ],
          [
            { text: 'Teléfono', style: 'tableHeader' },
            this.nullAsNA(this.patientData.phoneNumber),
            { text: 'Estrato', style: 'tableHeader' },
            this.nullAsNA(this.patientData.stratum)
          ],
          [
            { text: 'EPS', style: 'tableHeader' },
            this.nullAsNA(this.patientData.epsName),
            { text: 'Régimen', style: 'tableHeader' },
            this.nullAsNA(this.patientData.regime)
          ],
           [
            { text: 'Dirección', style: 'tableHeader' },
            this.nullAsNA(this.patientData.address), // 👈 ocupa las 3 columnas siguientes
            { text: 'Ciudad', style: 'tableHeader' },
            this.nullAsNA(this.patientData.municipalityName),
          ],
        ]
      },
      layout: 'lightHorizontalLines',
      margin: [0, 0, 0, 15]
    };
  }

  private buildMedicalHistorySection() {
  const h = this.medicalHistory!;

  return {
    table: {
      widths: ['30%', '70%'],
      body: [
        [{ text: 'Patológicos', style: 'tableHeader' }, this.nullAsNA(h.pathologicalHistory)],
        [{ text: 'Quirúrgicos', style: 'tableHeader' }, this.nullAsNA(h.surgicalHistory)],
        [{ text: 'Alérgicos', style: 'tableHeader' }, this.nullAsNA(h.allergicHistory)],
        [{ text: 'Farmacológicos', style: 'tableHeader' }, this.nullAsNA(h.pharmacologicalHistory)],
        [{ text: 'Familiares', style: 'tableHeader' }, this.nullAsNA(h.familyHistory)],
        [{ text: 'Gineco-obstétricos', style: 'tableHeader' }, this.nullAsNA(h.gynecoObstetricHistory)],
        [{ text: 'Ocupacionales', style: 'tableHeader' }, this.nullAsNA(h.occupationalHistory)],
        [{ text: 'Psiquiátricos', style: 'tableHeader' }, this.nullAsNA(h.psychiatricHistory)],
        [{ text: 'Traumáticos', style: 'tableHeader' }, this.nullAsNA(h.traumaticHistory)],
        [{ text: 'Inmunológicos', style: 'tableHeader' }, this.nullAsNA(h.immunologicalHistory)],
        [{ text: 'Tabaquismo', style: 'tableHeader' },
          h.smoker
            ? `Sí, ${h.smokingYears} años - ${h.cigarettesPerDay} cigarrillos/día - Índice: ${h.smokingIndex}`
            : 'No'],
        [{ text: 'Alcohol', style: 'tableHeader' },
          h.alcoholConsumer
            ? `Sí, frecuencia: ${this.nullAsNA(h.alcoholFrequency)}`
            : 'No'],
        [{ text: 'Drogas', style: 'tableHeader' },
          h.drugUse
            ? `Sí, ${this.nullAsNA(h.drugDetails)}`
            : 'No'],
        [{ text: 'Observaciones', style: 'tableHeader' }, this.nullAsNA(h.observations)]
      ]
    },
    layout: 'lightHorizontalLines',
    margin: [0, 0, 0, 15]
  };
}



  private buildGeneralStatusTable() {
    return {
      table: {
        widths: ['35%', '65%'],
        body: [
          [{ text: 'Estado de Hidratación', style: 'tableHeader' }, this.nullAsNA(this.dataConsultation?.hydrationStatus)],
          [{ text: 'Nivel de Glasgow', style: 'tableHeader' }, this.nullAsNA(this.dataConsultation?.glasgowScore)],
          [{ text: 'Estado de Conciencia', style: 'tableHeader' }, this.nullAsNA(this.dataConsultation?.consciousnessStatus)],
          [{ text: 'Estado General', style: 'tableHeader' }, this.nullAsNA(this.dataConsultation?.generalStatus)]
        ]
      },
      layout: 'lightHorizontalLines',
      margin: [0, 0, 0, 15]
    };
  }

  private buildVitalSignsTable() {
    return {
      table: {
        widths: ['35%', '65%'],
        body: [
          [{ text: 'Presión Arterial', style: 'tableHeader' }, this.nullAsNA(this.dataConsultation?.vitalSigns_BP)],
          [{ text: 'Frecuencia Cardíaca', style: 'tableHeader' }, this.nullAsNA(this.dataConsultation?.vitalSigns_HR)],
          [{ text: 'Frecuencia Respiratoria', style: 'tableHeader' }, this.nullAsNA(this.dataConsultation?.vitalSigns_RR)],
          [{ text: 'Temperatura', style: 'tableHeader' }, this.nullAsNA(this.dataConsultation?.vitalSigns_Temp)],

          [{ text: 'Saturación de Oxígeno (SpO2)', style: 'tableHeader' }, this.nullAsNA(this.dataConsultation?.vitalSigns_SPO2)],
          [{ text: 'IMC', style: 'tableHeader' }, this.nullAsNA(this.dataConsultation?.bmi)],
          [{ text: 'Talla (cms)', style: 'tableHeader' }, this.nullAsNA(this.dataConsultation?.heightCm)],
          [{ text: 'Peso (Kg)', style: 'tableHeader' }, this.nullAsNA(this.dataConsultation?.weightKg)]
        ]
      },
      layout: 'lightHorizontalLines',
      margin: [0, 0, 0, 15]
    };
  }

  private buildPhysicalExamTable() {
    return {
      table: {
        widths: ['35%', '65%'],
        body: [
          [{ text: 'Cabeza y Cuello', style: 'tableHeader' }, this.nullAsNA(this.dataConsultation?.physicalExam_HeadNeck)],
          [{ text: 'Tórax', style: 'tableHeader' }, this.nullAsNA(this.dataConsultation?.physicalExam_Chest)],
          [{ text: 'Corazón', style: 'tableHeader' }, this.nullAsNA(this.dataConsultation?.physicalExam_Heart)],
          [{ text: 'Abdomen', style: 'tableHeader' }, this.nullAsNA(this.dataConsultation?.physicalExam_Abdomen)],
          [{ text: 'Genitourinario', style: 'tableHeader' }, this.nullAsNA(this.dataConsultation?.physicalExam_GU)],
          [{ text: 'Musculoesquelético', style: 'tableHeader' }, this.nullAsNA(this.dataConsultation?.physicalExam_Musculoskeletal)],
          [{ text: 'Piel', style: 'tableHeader' }, this.nullAsNA(this.dataConsultation?.physicalExam_Skin)],
          [{ text: 'Observaciones', style: 'tableHeader' }, this.nullAsNA(this.dataConsultation?.observations)]
        ]
      },
      layout: 'lightHorizontalLines',
      margin: [0, 0, 0, 15]
    };
  }


  private buildDiagnosisTable() {
    return {
      table: {
        widths: ['25%', '55%', '20%'],
        body: [
          [
            { text: 'Código', style: 'tableHeader' },
            { text: 'Diagnóstico', style: 'tableHeader' },
            { text: 'Tipo', style: 'tableHeader' }
          ],
          ...this.diagnoses.map(d => [
            this.nullAsNA(d.diagnosisCode),
            this.nullAsNA(d.diagnosisDescription),
            this.nullAsNA(d.diagnosisType)
          ])
        ]
      },
      layout: 'lightHorizontalLines',
      margin: [0, 0, 0, 15]
    };
  }


  private buildDoctorSignature() {
    const name =
      `${this.doctorProfile?.name ?? ''} ${this.doctorProfile?.secondName ?? ''} ${this.doctorProfile?.lastName ?? ''} ${this.doctorProfile?.secondLastName ?? ''}`
        .replace(/\s+/g, ' ')
        .trim();

    return {
      unbreakable: true, // 👈 evita que se parta en dos páginas
      margin: [0, 30, 0, 0],
      stack: [
        this.doctorProfile?.digitalSignature
          ? { image: this.doctorProfile.digitalSignature, width: 90, alignment: 'center', margin: [0, 10, 0, 5] }
          : {},
        {
          text: `${name}\n${this.nullAsNA(this.doctorProfile?.specialityDescription)}\nRegistro Médico: ${this.nullAsNA(this.doctorProfile?.medicalRegistre)}`,
          alignment: 'center'
        }
      ]
    };
  }

  // ===========================
  // Helpers
  // ===========================
  private formatDate(date: string | Date): string {
    return new Date(date).toLocaleDateString('es-CO');
  }

  private getAgeFromBirthDay(birthDay: string): number {
    if (!birthDay) return 0;
    const today = new Date();
    const birth = new Date(birthDay);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  }

  private nullAsNA(value: any): string {
    if (value === null || value === undefined) return 'N/A';
    const s = String(value).trim();
    return s === '' ? 'N/A' : s;
  }
}
