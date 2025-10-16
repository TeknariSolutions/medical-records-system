import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { OrderDTO } from 'src/app/core/DTOs/app/order.dto';
import { PatientDTO } from 'src/app/core/DTOs/app/patient.dto';
import { DoctorProfileResponseDTO } from 'src/app/core/DTOs/app/doctor-profile-dto';
import { DoctorProfileUseCase } from 'src/app/infrastructure/use-cases/app/doctor-profile-use-case';
import { PatientsUseCase } from 'src/app/infrastructure/use-cases/app/patients.use-case';
import { NotificationsService } from 'src/app/infrastructure/services/common/notifications/notifications.service';
import pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';

(pdfMake as any).vfs = (pdfFonts as any).vfs;

@Component({
  selector: 'app-details-orden',
  standalone: true,
  imports: [CommonModule],
  template: ''
})
export class DetailsOrdenComponent implements OnInit {

  @Input() idPatient!: number;
  @Input() orderData!: OrderDTO;
  @Input() patientData!: PatientDTO;

  doctorProfile: DoctorProfileResponseDTO | null = null;

  constructor(
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
    // 👨‍⚕️ Cargar perfil del médico
    if (this.orderData.idUser) {
      const doctor = await firstValueFrom(
        this._doctorProfileUseCase.GetDoctorProfileById(this.orderData.idUser)
      );
      this.doctorProfile = doctor?.data ?? null;
    }

    // 👤 Cargar datos del paciente
    if (this.idPatient) {
      const patient = await firstValueFrom(this._patientsUseCase.GetPatientByIdAll(this.idPatient));
      this.patientData = patient;
    }
  }

  // ===============================
  // 🧾 Generar PDF
  // ===============================
  async generatePDF(): Promise<void> {
    try {
      this._notificationService.showInfoMessage('Generando orden médica, por favor espere...');
      await this.ensureDataLoaded();
      const logo = await this.loadImageAsBase64('assets/images/HEADER-HISTORIA3.png');

      const docDefinition = this.buildDocDefinition(logo);

      const fullName = `
        ${this.patientData.firstName ?? ''}
        ${this.patientData.secondName ?? ''}
        ${this.patientData.firstLastName ?? ''}
        ${this.patientData.secondLastName ?? ''}
      `.replace(/\s+/g, ' ').trim()
       .normalize('NFD')
       .replace(/[\u0300-\u036f]/g, '')
       .replace(/\W+/g, '_');

      const filename = `Orden_Medica_${fullName}_${this.formatDate(new Date())}.pdf`;
      pdfMake.createPdf(docDefinition).download(filename);

      this._notificationService.showSuccessMessage('Documento generado correctamente ✅');
    } catch (error) {
      console.error('Error al generar la orden:', error);
      this._notificationService.showToastErrorMessage('Ocurrió un error al generar la orden médica.');
    }
  }

  // ===============================
  // 📑 Definición del documento
  // ===============================
  private buildDocDefinition(logoBase64: string) {
    return {
      pageSize: 'LETTER',
      pageMargins: [30, 110, 30, 30],

      header: {
        image: logoBase64,
        width: 575,
        height: 90,
        alignment: 'center',
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
          text: 'ORDEN MÉDICA',
          style: 'header',
          alignment: 'center',
          margin: [0, 0, 0, 20]
        },

        this.buildPatientInfoTable(),

        {
          table: {
            widths: ['30%', '70%'],
            body: [
              [{ text: 'Fecha de Orden', style: 'tableHeader' }, this.formatDate(this.orderData.orderDate)],
              [{ text: 'Número de Orden', style: 'tableHeader' }, `${this.orderData.idOrder}`]
            ]
          },
          layout: 'lightHorizontalLines',
          margin: [0, 0, 0, 15]
        },

        { text: 'OBSERVACIONES:', style: 'sectionHeader' },
        { text: this.nullAsNA(this.orderData.generalObservations), margin: [0, 5, 0, 20] },

        ...(this.doctorProfile ? [this.buildDoctorSignature()] : [])
      ],

      styles: {
        header: { fontSize: 12, bold: true },
        sectionHeader: { fontSize: 10, bold: true, margin: [0, 15, 0, 8] },
        tableHeader: { bold: true, fillColor: '#f2f2f2' }
      },
      defaultStyle: {
        fontSize: 9
      }
    };
  }

  // ===============================
  // 👤 Datos del paciente
  // ===============================
  private buildPatientInfoTable() {
    const fullName = `${this.patientData.firstName ?? ''} ${this.patientData.secondName ?? ''} ${this.patientData.firstLastName ?? ''} ${this.patientData.secondLastName ?? ''}`.trim();

    return {
      table: {
        widths: ['30%', '70%'],
        body: [
          [{ text: 'Paciente', style: 'tableHeader' }, fullName || 'N/A'],
          [{ text: 'Documento', style: 'tableHeader' }, `${this.patientData.documentType ?? ''} ${this.patientData.idDocument ?? ''}`],
          [{ text: 'Teléfono', style: 'tableHeader' }, this.nullAsNA(this.patientData.phoneNumber)],
          [{ text: 'Dirección', style: 'tableHeader' }, this.nullAsNA(this.patientData.address)]
        ]
      },
      layout: 'lightHorizontalLines',
      margin: [0, 0, 0, 15]
    };
  }

  // ===============================
  // ✍️ Firma del médico
  // ===============================
  private buildDoctorSignature() {
    const name = `${this.doctorProfile?.name ?? ''} ${this.doctorProfile?.secondName ?? ''} ${this.doctorProfile?.lastName ?? ''} ${this.doctorProfile?.secondLastName ?? ''}`.trim();

    return {
      unbreakable: true,
      margin: [0, 40, 0, 0],
      stack: [
        this.doctorProfile?.digitalSignature
          ? { image: this.doctorProfile.digitalSignature, width: 100, alignment: 'center', margin: [0, 10, 0, 5] }
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
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('es-CO');
  }

  private nullAsNA(value: any): string {
    if (value === null || value === undefined) return 'N/A';
    const s = String(value).trim();
    return s === '' ? 'N/A' : s;
  }
}
