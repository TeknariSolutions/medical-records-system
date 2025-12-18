
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
import { MedicalEquipmentDTO } from 'src/app/core/DTOs/app/medical-equipment.dto';
(pdfMake as any).vfs = (pdfFonts as any).vfs;
 import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType } from 'docx';
import { saveAs } from 'file-saver'; 

/* import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType } from 'docx';
import { saveAs } from 'file-saver'; */








type PrescriptionDetailExtendedDTO = PrescriptionDetailDTO & {
  medicineName?: string;
  medicalEquipment?: MedicalEquipmentDTO;
};


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

  //details: PrescriptionDetailDTO[] = [];
  details: PrescriptionDetailExtendedDTO[] = [];

  doctorProfile: DoctorProfileResponseDTO | null = null;

  constructor(
    private _prescriptionDetailsUseCase: PrescriptionDetailsUseCase,
    private _doctorProfileUseCase: DoctorProfileUseCase,
    private _patientsUseCase: PatientsUseCase,
    private _notificationService: NotificationsService
  ) {}

  async ngOnInit(): Promise<void> {

    console.log(this.prescriptionData)
    await this.generatePDF();
  }

  // ===============================
  // Cargar imagen de encabezado
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
  // Cargar datos antes de generar PDF
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
  // Generar PDF
  // ===============================
  async generatePDF(): Promise<void> {
    try {
      this._notificationService.showInfoMessage('Generando prescripción, por favor espere...');
      await this.ensureDataLoaded();

      const logo = await this.loadImageAsBase64('assets/images/HEADER-HISTORIA4.png');

      const medicineDetails = this.details.filter(d => d.idMedicine && d.idMedicine > 0);
      const equipmentDetails = this.details.filter(d => d.idMedicalEquipment && d.idMedicalEquipment > 0);

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
  // Generar WORD
  // ===============================
  async generateWord(): Promise<void> {
  try {
    this._notificationService.showInfoMessage('Generando documento Word...');

    await this.ensureDataLoaded();

    const medicineDetails = this.details.filter(d => d.idMedicine && d.idMedicine > 0);
    const equipmentDetails = this.details.filter(d => d.idMedicalEquipment && d.idMedicalEquipment > 0);

    const doc = new Document({
      sections: [
        {
          children: [
            this.buildWordTitle(),
            ...this.buildPatientInfoWord(),
           ...this.buildMedicinesWord(medicineDetails),
            ...this.buildEquipmentWord(equipmentDetails)
          ]
        }
      ]
    });

    const blob = await Packer.toBlob(doc);

    const fullName = `${this.patientData.firstName ?? ''} ${this.patientData.firstLastName ?? ''}`
      .replace(/\s+/g, '_');

    saveAs(blob, `Prescripcion_${fullName}.docx`);

    this._notificationService.showSuccessMessage('Documento Word generado correctamente');
  } catch (error) {
    console.error(error);
    this._notificationService.showToastErrorMessage('Error al generar el documento Word');
  }
}

private buildWordTitle(): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({
        text: 'PRESCRIPCIÓN MÉDICA',
        bold: true,
        size: 28
      })
    ],
    alignment: 'center',
    spacing: { after: 300 }
  });
}


private buildPatientInfoWord(): Paragraph[] {
  const fullName = `${this.patientData.firstName ?? ''} ${this.patientData.secondName ?? ''} 
    ${this.patientData.firstLastName ?? ''} ${this.patientData.secondLastName ?? ''}`.trim();

  return [
    new Paragraph(`Paciente: ${fullName}`),
    new Paragraph(`Documento: ${this.patientData.documentType ?? ''} ${this.patientData.idDocument ?? ''}`),
    new Paragraph(`Fecha de Prescripción: ${this.formatDateTime(this.prescriptionData.prescriptionDate)}`),
    new Paragraph({ text: '', spacing: { after: 200 } })
  ];
}

 private buildMedicinesWord(details: PrescriptionDetailExtendedDTO[]): Table[] {
  if (!details.length) return [];

  return [
    new Paragraph({ text: 'DETALLES DE MEDICAMENTOS',  spacing: { after: 200 } }),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            'Medicamento', 'Dosis', 'Frecuencia', 'Duración', 'Cantidad', 'Instrucciones'
          ].map(h => new TableCell({
            children: [new Paragraph({ text: h})]
          }))
        }),
        ...details.map(d =>
          new TableRow({
            children: [
              d.activeIngredient,
              d.dosage,
              d.frequency,
              d.duration,
              d.quantity,
              d.instructions
            ].map(v => new TableCell({
              children: [new Paragraph(this.nullAsNA(v))]
            }))
          })
        )
      ]
    }),
    new Paragraph({ text: '', spacing: { after: 300 } })
  ];
}

private buildEquipmentWord(details: any[]): Table[] {
  if (!details.length) return [];

  return [
    new Paragraph({ text: 'DETALLES DE EQUIPOS MÉDICOS', spacing: { after: 200 } }),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: ['Equipo Médico', 'Instrucciones'].map(h =>
            new TableCell({ children: [new Paragraph({ text: h })] })
          )
        }),
        ...details.map(d =>
          new TableRow({
            children: [
              new TableCell({ children: [new Paragraph(this.nullAsNA(d.equipmentName))] }),
              new TableCell({ children: [new Paragraph(this.nullAsNA(d.instructions))] })
            ]
          })
        )
      ]
    })
  ];
}
 


  // ===============================
  // Definición de documento
  // ===============================

private buildDocDefinition(logoBase64: string) {
  const medicineDetails = this.details.filter(d => d.idMedicine && d.idMedicine > 0);
  const equipmentDetails = this.details.filter(d => d.idMedicalEquipment && d.idMedicalEquipment > 0);

  const content: any[] = [
    {
      text: 'PRESCRIPCIÓN MÉDICA',
      style: 'header',
      alignment: 'center',
      margin: [0, 2, 0, 6] // 🔸 título más pegado al paciente
    },
    this.buildPatientInfoSection()
  ];

  if (medicineDetails.length > 0) {
    content.push(
      { text: 'DETALLES DE MEDICAMENTOS', style: 'sectionHeader', margin: [0, 0, 0, 2] },
      this.buildPrescriptionTable(medicineDetails)
    );
  }

  if (equipmentDetails.length > 0) {
    content.push(
      { text: 'DETALLES DE EQUIPOS MÉDICOS', style: 'sectionHeader', margin: [0, 3, 0, 2] },
      this.buildEquipmentTable(equipmentDetails)
    );
  }

 /*  if (this.doctorProfile) {
    content.push(this.buildDoctorSignature());
  } */

  return {
    pageSize: { width: 612, height: 396 }, // Media carta horizontal
    pageMargins: [16, 55, 16, 16], // 🔸 más compactos arriba y abajo

    header: {
      image: logoBase64,
      width: 520,
      height: 70, // 🔸 menos alto
      alignment: 'center',
      margin: [0, 2, 0, 10]
    },

    footer: (currentPage: number, pageCount: number) => ({
      text: `${currentPage} / ${pageCount}`,
      alignment: 'right',
      margin: [0, 0, 15, 6],
      fontSize: 7
    }),

    content,
    styles: {
      header: { fontSize: 10, bold: true },
      sectionHeader: { fontSize: 8.5, bold: true },
      tableHeader: { bold: true, fillColor: '#f2f2f2', fontSize: 7.5 }
    },
    defaultStyle: {
      fontSize: 7.3,
      lineHeight: 1.0 // 🔸 líneas más pegadas
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
      body: [
        [{ text: 'Paciente', style: 'tableHeader' }, fullName || 'N/A'],
        [{ text: 'Documento', style: 'tableHeader' }, `${this.patientData.documentType ?? ''} ${this.patientData.idDocument ?? ''}`],
        [{ text: 'Fecha de Prescripción', style: 'tableHeader' }, this.formatDateTime(this.prescriptionData.prescriptionDate)]
      ]
    },
    layout: 'lightHorizontalLines',
    margin: [0, 0, 0, 10] // 🔸 menos separación después del paciente
  };
}

  // ===============================
  // Tabla de medicamentos
  // ===============================
 

  private buildPrescriptionTable(medicineDetails: PrescriptionDetailExtendedDTO[]) {
    return {
      table: {
        widths: ['30%', '10%', '15%', '15%', '10%', '20%'],
        dontBreakRows: true,
        body: [
          [
            { text: 'Medicamento', style: 'tableHeader' },
            { text: 'Dosis', style: 'tableHeader' },
            { text: 'Frecuencia', style: 'tableHeader' },
            { text: 'Duración', style: 'tableHeader' },
            { text: 'Cantidad', style: 'tableHeader' },
            { text: 'Instrucciones', style: 'tableHeader' }
          ],
          ...medicineDetails.map(d => [
            this.nullAsNA(d.activeIngredient),
            this.nullAsNA(d.dosage),
            this.nullAsNA(d.frequency),
            this.nullAsNA(d.duration),
            this.nullAsNA(d.quantity),
            this.nullAsNA(d.instructions)
          ])
        ]
      },
      layout: 'lightHorizontalLines',
      margin: [0, 0, 0, 15]
    };
  }

  private buildEquipmentTable(equipmentDetails: any[]) {
  return {
    table: {
      widths: ['60%', '40%'],
      dontBreakRows: true,
      body: [
        [
          { text: 'Equipo Médico', style: 'tableHeader' },
          { text: 'Instrucciones', style: 'tableHeader' }
        ],
        ...equipmentDetails.map(d => [
          this.nullAsNA(d.equipmentName),
          this.nullAsNA(d.instructions)
        ])
      ]
    },
    layout: 'lightHorizontalLines',
    margin: [0, 0, 0, 15]
  };
}


  // ===============================
  // Firma del médico
  // ===============================
private buildDoctorSignature() {
  const name = `${this.doctorProfile?.name ?? ''} ${this.doctorProfile?.secondName ?? ''} ${this.doctorProfile?.lastName ?? ''} ${this.doctorProfile?.secondLastName ?? ''}`.trim();

  return {
    unbreakable: true,
    margin: [0, 8, 0, 0], // 🔸 más pegada al final
    stack: [
      this.doctorProfile?.digitalSignature
        ? { image: this.doctorProfile.digitalSignature, width: 60, alignment: 'center', margin: [0, 6, 0, 2] }
        : {},
      {
        text: `${name}\n${this.nullAsNA(this.doctorProfile?.specialityDescription)}\nRegistro Médico: ${this.nullAsNA(this.doctorProfile?.medicalRegistre)}`,
        alignment: 'center',
        fontSize: 7.5
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
