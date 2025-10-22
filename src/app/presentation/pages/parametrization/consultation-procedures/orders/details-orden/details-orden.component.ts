import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { firstValueFrom, forkJoin } from 'rxjs';
import { OrderDTO } from 'src/app/core/DTOs/app/order.dto';
import { OrderDetailsDTO } from 'src/app/core/DTOs/app/order-details.dto';
import { PatientDTO } from 'src/app/core/DTOs/app/patient.dto';
import { DoctorProfileResponseDTO } from 'src/app/core/DTOs/app/doctor-profile-dto';

import { DoctorProfileUseCase } from 'src/app/infrastructure/use-cases/app/doctor-profile-use-case';
import { PatientsUseCase } from 'src/app/infrastructure/use-cases/app/patients.use-case';
import { OrderDetailsUseCase } from 'src/app/infrastructure/use-cases/app/order-details.use-case';
import { CupsCodeUseCase } from 'src/app/infrastructure/use-cases/common/cups-code.use.case';
import { NotificationsService } from 'src/app/infrastructure/services/common/notifications/notifications.service';

import pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
(pdfMake as any).vfs = (pdfFonts as any).vfs;

interface OrderDetailWithCode extends OrderDetailsDTO {
  cupsCodeText?: string; // "Código - Nombre" del CUPS
}

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
  orderDetails: OrderDetailWithCode[] = [];

  constructor(
    private _doctorProfileUseCase: DoctorProfileUseCase,
    private _patientsUseCase: PatientsUseCase,
    private _orderDetailsUseCase: OrderDetailsUseCase,
    private _cupsCodeUseCase: CupsCodeUseCase,
    private _notificationService: NotificationsService
  ) {}

  async ngOnInit(): Promise<void> {
    await this.generatePDF();
  }

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
  private async ensureDataLoaded(): Promise<void> {
    // 👨‍⚕️ Médico
    if (this.orderData.idUser) {
      const doctor = await firstValueFrom(
        this._doctorProfileUseCase.GetDoctorProfileById(this.orderData.idUser)
      );
      this.doctorProfile = doctor?.data ?? null;
    }

    // 👤 Paciente
    if (this.idPatient) {
      const patient = await firstValueFrom(this._patientsUseCase.GetPatientByIdAll(this.idPatient));
      this.patientData = patient;
    }

    // 📋 Detalles de la orden
    if (this.orderData.idOrder) {
      const detailsResp = await firstValueFrom(
        this._orderDetailsUseCase.GetListOrderDetailsByOrder(this.orderData.idOrder)
      );
      const details = detailsResp.results || [];

      // 📌 Traer info CUPS en paralelo
      const cupsRequests = details.map(d =>
        firstValueFrom(this._cupsCodeUseCase.GetCUPSCodeById(d.idCupsCode))
          .then(cups => ({
            ...d,
            cupsCodeText: `${cups.code} - ${cups.name}`
          }))
          .catch(() => ({
            ...d,
            cupsCodeText: 'N/A'
          }))
      );

      this.orderDetails = await Promise.all(cupsRequests);
    }
  }

  // ===============================
  async generatePDF(): Promise<void> {
    try {
      this._notificationService.showInfoMessage('Generando orden médica, por favor espere...');
      await this.ensureDataLoaded();
      const logo = await this.loadImageAsBase64('assets/images/HEADER-HISTORIA4.png');

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
  private buildDocDefinition(logoBase64: string) {
    return {
      /* pageSize: 'LETTER',
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
      }), */

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

      // Pie de página con número
      footer: (currentPage: number, pageCount: number) => ({
        text: `${currentPage} / ${pageCount}`,
        alignment: 'right',
        margin: [0, 0, 20, 10],
        fontSize: 8
      }),

      content: [
        {
          text: 'ORDEN MÉDICA',
          style: 'header',
          alignment: 'center',
          margin: [0, 0, 0, 20]
        },

        this.buildPatientInfoTable(),
        //this.buildOrderInfoTable(),

        { text: 'DETALLE DE ORDENES', style: 'sectionHeader' },

        ...(this.orderDetails.length > 0 ? [this.buildOrderDetailsTable()] : []),

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
  private buildPatientInfoTable() {
    const fullName = `${this.patientData.firstName ?? ''} ${this.patientData.secondName ?? ''} ${this.patientData.firstLastName ?? ''} ${this.patientData.secondLastName ?? ''}`.trim();

    return {
      table: {
        widths: ['30%', '70%'],
        body: [
          [{ text: 'Paciente', style: 'tableHeader' }, fullName || 'N/A'],
          [{ text: 'Documento', style: 'tableHeader' }, `${this.patientData.documentType ?? ''} ${this.patientData.idDocument ?? ''}`],
          [{ text: 'Teléfono', style: 'tableHeader' }, this.nullAsNA(this.patientData.phoneNumber)],
          [{ text: 'Dirección', style: 'tableHeader' }, this.nullAsNA(this.patientData.address)],
          [{ text: 'Fecha de Orden', style: 'tableHeader' }, this.formatDate(this.orderData.orderDate)],
        ]
      },
      layout: 'lightHorizontalLines',
      margin: [0, 0, 0, 15]
    };
  }

/*   private buildOrderInfoTable() {
    return {
      table: {
        widths: ['30%', '70%'],
        body: [
          [{ text: 'Fecha de Orden', style: 'tableHeader' }, this.formatDate(this.orderData.orderDate)],
          [{ text: 'Número de Orden', style: 'tableHeader' }, `${this.orderData.idOrder}`]
        ]
      },
      layout: 'lightHorizontalLines',
      margin: [0, 0, 0, 15]
    };
  } */

  // 📋 Tabla con detalles CUPS
  private buildOrderDetailsTable() {
    const body = [
      [
        { text: 'Código CUPS', style: 'tableHeader' },
        //{ text: 'Descripción del Procedimiento', style: 'tableHeader' },
        { text: 'Cantidad', style: 'tableHeader' },
        { text: 'Instrucciones', style: 'tableHeader' }
      ],
      ...this.orderDetails.map(d => [
        this.nullAsNA(d.cupsCodeText),
        //this.nullAsNA(d.procedureDescription),
        this.nullAsNA(d.quantity),
        this.nullAsNA(d.instructions)
      ])
    ];

    return {
      table: {
        widths: ['35%', '15%', '50%'],
        body
      },
      layout: 'lightHorizontalLines',
      margin: [0, 0, 0, 20]
    };
  }

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
