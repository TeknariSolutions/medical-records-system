
import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { PrescriptionDTO } from 'src/app/core/DTOs/app/prescription.dto';
import { PrescriptionDetailDTO } from 'src/app/core/DTOs/app/prescription-details.dto';
import { PatientDTO } from 'src/app/core/DTOs/app/patient.dto';
import { DoctorProfileResponseDTO } from 'src/app/core/DTOs/app/doctor-profile-dto';

import { PrescriptionDetailsUseCase } from 'src/app/infrastructure/use-cases/app/prescription-details.use-case';
import { DoctorProfileUseCase } from 'src/app/infrastructure/use-cases/app/doctor-profile-use-case';
import { PatientsUseCase } from 'src/app/infrastructure/use-cases/app/patients.use-case';
import { NotificationsService } from 'src/app/infrastructure/services/common/notifications/notifications.service';

import pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
(pdfMake as any).vfs = (pdfFonts as any).vfs;

@Component({
  selector: 'app-details-prescription',
  standalone: true,
  imports: [CommonModule],
  template: ''
})
export class DetailsPrescriptionComponent implements OnInit {
  @Input() idPatient!: number;
  @Input() idMedicalConsultation!: number;
  @Input() patientData!: PatientDTO;
  @Input() prescriptionData!: PrescriptionDTO;

  details: PrescriptionDetailDTO[] = [];
  doctorProfile: DoctorProfileResponseDTO | null = null;

  constructor(
    private _prescriptionDetailsUseCase: PrescriptionDetailsUseCase,
    private _doctorProfileUseCase: DoctorProfileUseCase,
    private _patientsUseCase: PatientsUseCase,
    private _notificationService: NotificationsService
  ) {}

  async ngOnInit(): Promise<void> {
    await this.generatePDF();
  }

  // ===============================
  // 📸 Cargar imagen de encabezado
  // ===============================
  private async loadImageAsBase64(path: string): Promise<string> {
    const response = await fetch(path);
    const blob = await response.blob();
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  // ===============================
  // 📥 Cargar datos antes de generar PDF
  // ===============================
  private async ensureDataLoaded(): Promise<void> {
    if (this.idPatient) {
      const patient = await firstValueFrom(this._patientsUseCase.GetPatientByIdAll(this.idPatient));
      this.patientData = patient;
    }

    if (this.prescriptionData?.idPrescription) {
      const details = await firstValueFrom(
        this._prescriptionDetailsUseCase.GetPrescriptionDetailsByIdPrescription(this.prescriptionData.idPrescription)
      );
      this.details = details;
    }

    if (this.prescriptionData?.idUser) {
      const doctor = await firstValueFrom(
        this._doctorProfileUseCase.GetDoctorProfileById(this.prescriptionData.idUser)
      );
      this.doctorProfile = doctor?.data ?? null;
    }
  }

  // ===============================
  // 🧾 Generar PDF
  // ===============================
  async generatePDF(): Promise<void> {
    try {
      this._notificationService.showInfoMessage('Generando prescripción, por favor espere...');
      await this.ensureDataLoaded();

      const logo = await this.loadImageAsBase64('assets/images/HEADER-HISTORIA4.png');
      const docDefinition = this.buildDocDefinition(logo);

      const fullName = `
        ${this.patientData.firstName ?? ''} 
        ${this.patientData.secondName ?? ''} 
        ${this.patientData.firstLastName ?? ''} 
        ${this.patientData.secondLastName ?? ''}
      `
        .replace(/\s+/g, ' ')
        .trim()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\W+/g, '_');

      const filename = `Prescripcion_Medica_${fullName}_${this.formatDate(new Date())}.pdf`;
      pdfMake.createPdf(docDefinition).download(filename);

      this._notificationService.showSuccessMessage('Documento generado correctamente');
    } catch (error) {
      console.error('Error al generar la prescripción:', error);
      this._notificationService.showToastErrorMessage('Ocurrió un error al generar la prescripción.');
    }
  }

  // ===============================
  // 🧾 Definición de documento
  // ===============================
 /*  private buildDocDefinition(logoBase64: string) {
    return {
      pageSize: 'LETTER',
      pageMargins: [30, 120, 30, 40],

      header: {
        image: logoBase64,
        width: 575,
        height: 90,
        alignment: 'center',
        margin: [20, 10, 0, 30] // 👈 margen inferior debajo del header
      },

      footer: (currentPage: number, pageCount: number) => ({
        text: `${currentPage} / ${pageCount}`,
        alignment: 'right',
        margin: [0, 0, 40, 20],
        fontSize: 9
      }),

      content: [
        {
          text: 'PRESCRIPCIÓN MÉDICA',
          style: 'header',
          alignment: 'center',
          margin: [0, 0, 0, 20]
        },

        this.buildPatientInfoSection(),

        { text: 'DETALLE DE MEDICAMENTOS', style: 'sectionHeader' },
        this.buildPrescriptionTable(),

        ...(this.doctorProfile ? [this.buildDoctorSignature()] : [])
      ],

      styles: {
        header: { fontSize: 12, bold: true },
        sectionHeader: { fontSize: 11, bold: true, margin: [0, 15, 0, 10] },
        tableHeader: { bold: true, fillColor: '#f2f2f2' }
      },
      defaultStyle: { fontSize: 9 }
    };
  }   */

  private buildDocDefinition(logoBase64: string) {
    return {
      // Media carta horizontal (Landscape)
      pageSize: { width: 612, height: 396 },
      pageMargins: [25, 90, 25, 30], //  Márgenes más compactos

      // Encabezado con logo
      header: {
        image: logoBase64,
        width: 550, // ajustado al ancho de media carta horizontal
        height: 90,
        alignment: 'center',
        margin: [0, 10, 0, 20]
      },

      headerMargin: [0, 0, 0, 30], 

      // Pie de página con número
      footer: (currentPage: number, pageCount: number) => ({
        text: `${currentPage} / ${pageCount}`,
        alignment: 'right',
        margin: [0, 0, 20, 10],
        fontSize: 8
      }),

      // Contenido
      content: [
        {
          text: 'PRESCRIPCIÓN MÉDICA',
          style: 'header',
          alignment: 'center',
          margin: [0, 20, 20, 25]
        },

        this.buildPatientInfoSection(),
        { text: 'DETALLES DE MEDICAMENTOS', style: 'sectionHeader' },
        this.buildPrescriptionTable(),

        ...(this.doctorProfile ? [this.buildDoctorSignature()] : [])
      ],

      // Estilos globales
      styles: {
        header: { fontSize: 12, bold: true },
        sectionHeader: { fontSize: 10, bold: true, margin: [0, 10, 0, 8] },
        tableHeader: { bold: true, fillColor: '#f2f2f2' }
      },

      // 🔸 Tamaño de fuente más pequeño para aprovechar espacio horizontal
      defaultStyle: {
        fontSize: 9
      }
    };
  } 

  // ===============================
  // 👤 Datos del paciente
  // ===============================
  private buildPatientInfoSection() {
    const fullName = `${this.patientData.firstName ?? ''} ${this.patientData.secondName ?? ''} ${this.patientData.firstLastName ?? ''} ${this.patientData.secondLastName ?? ''}`.trim();

    return {
      table: {
        widths: ['30%', '70%'],
       /*  body: [
          [{ text: 'Paciente', style: 'tableHeader' }, fullName || 'N/A'],
          [{ text: 'Documento', style: 'tableHeader' }, `${this.patientData.documentType ?? ''} ${this.patientData.idDocument ?? ''}`],
          [{ text: 'Fecha de Prescripción', style: 'tableHeader' }, this.formatDateTime(this.prescriptionData.prescriptionDate)]
        ] */

        body: [
          [{ text: 'Paciente', style: 'tableHeader' }, fullName || 'N/A'],
          [{ text: 'Documento', style: 'tableHeader' }, `${this.patientData.documentType ?? ''} ${this.patientData.idDocument ?? ''}`],
          [{ text: 'Teléfono', style: 'tableHeader' }, this.nullAsNA(this.patientData.phoneNumber)],
          [{ text: 'Dirección', style: 'tableHeader' }, this.nullAsNA(this.patientData.address)],
          [{ text: 'Fecha de Prescripción', style: 'tableHeader' }, this.formatDate(this.prescriptionData.prescriptionDate)],
        ]
      },
      layout: 'lightHorizontalLines',
      margin: [0, 0, 0, 30]
    };
  }

  // ===============================
  // 💊 Tabla de medicamentos
  // ===============================
  /* private buildPrescriptionTable() {
    return {
      table: {
        widths: ['30%', '10%', '15%', '15%', '30%'],
        body: [
          [
            { text: 'Medicamento', style: 'tableHeader' },
            { text: 'Dosis', style: 'tableHeader' },
            { text: 'Frecuencia', style: 'tableHeader' },
            { text: 'Duración', style: 'tableHeader' },
            { text: 'Instrucciones', style: 'tableHeader' }
          ],
          ...this.details.map(d => [
            this.nullAsNA(d.activeIngredient),
            this.nullAsNA(d.dosage),
            this.nullAsNA(d.frequency),
            this.nullAsNA(d.duration),
            this.nullAsNA(d.instructions)
          ])
        ]
      },
      layout: 'lightHorizontalLines',
      margin: [0, 0, 0, 15]
    };
  }  */

  private buildPrescriptionTable() {
    return {
      table: {
        widths: ['30%', '15%', '15%', '15%', '25%'],
        dontBreakRows: true,
        body: [
          [
            { text: 'Medicamento', style: 'tableHeader' },
            { text: 'Dosis', style: 'tableHeader' },
            { text: 'Frecuencia', style: 'tableHeader' },
            { text: 'Duración', style: 'tableHeader' },
            { text: 'Instrucciones', style: 'tableHeader' }
          ],
          ...this.details.map(d => [
            this.nullAsNA(d.activeIngredient),
            this.nullAsNA(d.dosage),
            this.nullAsNA(d.frequency),
            this.nullAsNA(d.duration),
            this.nullAsNA(d.instructions)
          ])
        ]
      },
      layout: 'lightHorizontalLines',
      margin: [0, 0, 0, 15]
    };
  }


 /*  private buildPrescriptionTable() {
    // Si no hay detalles, retornamos un texto informativo
    if (!this.details || this.details.length === 0) {
      return { text: 'No hay medicamentos prescritos.', italics: true, margin: [0, 0, 0, 15] };
    }

    const body: any[] = [];

    // Cabecera principal
    body.push([
      { text: 'Medicamento', style: 'tableHeader' },
      { text: 'Dosis', style: 'tableHeader' },
      { text: 'Frecuencia', style: 'tableHeader' },
      { text: 'Duración', style: 'tableHeader' },
      { text: 'Cantidad', style: 'tableHeader' }
    ]);

    // Cabecera secundaria para instrucciones (fila aparte)
    body.push([
      { text: 'Instrucciones', style: 'tableHeader', colSpan: 5, alignment: 'left' },
      {}, {}, {}, {}
    ]);

    // Filas dinámicas de medicamentos
    this.details.forEach((d) => {
      // Fila principal
      body.push([
        this.nullAsNA(d.activeIngredient),
        this.nullAsNA(d.dosage),
        this.nullAsNA(d.frequency),
        this.nullAsNA(d.duration),
        this.nullAsNA(d.prescribedQuantity)
      ]);

      // Fila de instrucciones
      body.push([
        { text: this.nullAsNA(d.instructions), colSpan: 5 },
        {}, {}, {}, {}
      ]);
    });

    return {
      table: {
        widths: ['30%', '15%', '15%', '15%', '25%'], // más espacio a Medicamento y Cantidad
        body
      },
      layout: 'lightHorizontalLines',
      margin: [0, 0, 0, 15]
    };
  } */

  // ===============================
  // Firma del médico
  // ===============================
  private buildDoctorSignature() {
    const name = `${this.doctorProfile?.name ?? ''} ${this.doctorProfile?.secondName ?? ''} ${this.doctorProfile?.lastName ?? ''} ${this.doctorProfile?.secondLastName ?? ''}`.trim();

    return {
      unbreakable: true,
      margin: [0, 40, 0, 0],
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

  // ===============================
  // 🛠 Helpers
  // ===============================
  private formatDate(date: string | Date): string {
    return new Date(date).toLocaleDateString('es-CO');
  }

  private formatDateTime(date: string | Date): string {
    return new Date(date).toLocaleString('es-CO', { hour12: true });
  }

  private nullAsNA(value: any): string {
    if (value === null || value === undefined) return 'N/A';
    const s = String(value).trim();
    return s === '' ? 'N/A' : s;
  }
}
