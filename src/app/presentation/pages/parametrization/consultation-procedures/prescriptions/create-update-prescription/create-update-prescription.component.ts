import { CommonModule } from '@angular/common';
import { Component, Input, EventEmitter, Output, ChangeDetectorRef, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { BsModalRef } from 'ngx-bootstrap/modal';

import { PrescriptionsUseCase } from 'src/app/infrastructure/use-cases/app/prescriptions.use-case';
import { PrescriptionDetailsUseCase } from 'src/app/infrastructure/use-cases/app/prescription-details.use-case';
import { PrescriptionDTO } from 'src/app/core/DTOs/app/prescription.dto';
import { PrescriptionDetailDTO } from 'src/app/core/DTOs/app/prescription-details.dto';
import { MedicalConsultationDTO } from 'src/app/core/DTOs/app/medical-consultation.dto';

import { MedicineDTO } from 'src/app/core/DTOs/app/medicine.dto';
import { PaginatorDTO } from 'src/app/core/DTOs/common/paginator/paginator.dto';
import { MedicineUseCase } from 'src/app/infrastructure/use-cases/app/medicine.use-case';
import { TableResultDTO } from 'src/app/core/DTOs/common/table-result/table-result.dto';
import { DateTimeHelper } from 'src/app/infrastructure/helpers/date-time.helper';

import { MedicalEquipmentDTO } from 'src/app/core/DTOs/app/medical-equipment.dto';
import { MedicalEquipmentsUseCase } from 'src/app/infrastructure/use-cases/app/medical-equipment.use.case';
import { map, forkJoin, Observable } from 'rxjs';

type DetailType = 'medicine' | 'equipment';

@Component({
  selector: 'app-create-update-prescription',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './create-update-prescription.component.html',
  styleUrl: './create-update-prescription.component.css'
})
export class CreateUpdatePrescriptionComponent implements OnInit {

  @Input() consultationData!: MedicalConsultationDTO;
  @Input() prescriptionToEdit?: PrescriptionDTO;
  @Output() onClose = new EventEmitter<string>();

  prescriptionForm!: FormGroup;

  // Sugerencias por índice
  medicinesSuggestions: MedicineDTO[][] = [];
  showMedicinesDropdown: boolean[] = [];
  medicinesPaginator: PaginatorDTO[] = [];
  totalPagesByDetail: number[] = [];

  equipmentSuggestions: MedicalEquipmentDTO[][] = [];
  showEquipmentsDropdown: boolean[] = [];
  equipmentsPaginator: PaginatorDTO[] = [];

  submitted = false;

  constructor(
    private fb: FormBuilder,
    private prescriptionsUseCase: PrescriptionsUseCase,
    private prescriptionDetailsUseCase: PrescriptionDetailsUseCase,
    private medicineUseCase: MedicineUseCase,
    private _medicalEquipmentsUseCase: MedicalEquipmentsUseCase,
    public bsModalRef: BsModalRef,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.prescriptionForm = this.fb.group({
      details: this.fb.array([])
    });

    // ✅ Ya NO agregamos un detalle por defecto.
    if (this.prescriptionToEdit) {
      this.loadPrescriptionDetails(this.prescriptionToEdit.idPrescription);
    }
  }

  get details(): FormArray {
    return this.prescriptionForm.get('details') as FormArray;
  }

  /** ---------- CARGA EN EDICIÓN ---------- */
  loadPrescriptionDetails(idPrescription: number) {
    this.prescriptionDetailsUseCase.GetPrescriptionDetailsByIdPrescription(idPrescription)
      .subscribe((rows: PrescriptionDetailDTO[]) => {
        rows.forEach(d => {
          if (d.idMedicalEquipment && d.idMedicalEquipment > 0) {
            // Equipo médico
            const group = this.createDetailGroup('equipment');
            group.patchValue({
              idPrescriptionDetail: d.idPrescriptionDetail,
              idMedicalEquipment: d.idMedicalEquipment,
              instructions: d.instructions
            });

            // Opcional: intentar obtener nombre para mostrar en input (si no hay endpoint por id, hacemos un fallback por listado)
            this.searchEquipmentById(d.idMedicalEquipment).subscribe(eq => {
              if (eq) group.get('equipmentName')?.setValue(`${eq.equipmentName} - ${eq.brand}`);
            });

            this.details.push(group);
            this._initArraysForIndex(this.details.length - 1);

          } else {
            // Medicamento
            const group = this.createDetailGroup('medicine');
            group.patchValue({
              idPrescriptionDetail: d.idPrescriptionDetail,
              idMedicine: d.idMedicine,
              dosage: d.dosage,
              frequency: d.frequency,
              duration: d.duration,
              quantity: d.quantity,
              instructions: d.instructions
            });

            // Mostrar nombre amigable
            this.medicineUseCase.GetMedicineById(d.idMedicine).subscribe(med => {
              if (med && med[0]) {
                group.get('medicineName')?.setValue(`${med[0].commercialName} - ${med[0].activeIngredient}`);
              }
            });

            this.details.push(group);
            this._initArraysForIndex(this.details.length - 1);
          }
        });
      });
  }

  /** Fallback: buscador por ID usando listado (si no hay endpoint directo por id) */
  searchEquipmentById(id: number): Observable<MedicalEquipmentDTO | undefined> {
    const paginator: PaginatorDTO = { pageIndex: 1, pageSize: 100 }; // intentamos un bloque grande
    return this._medicalEquipmentsUseCase.GetListMedicalEquipment(paginator).pipe(
      map((data: any) => (data?.results || []).find((x: MedicalEquipmentDTO) => x.idMedicalEquipment === id))
    );
  }

  /** ---------- CREACIÓN DE GRUPOS ---------- */
  private createDetailGroup(type: DetailType): FormGroup {
    const isMedicine = type === 'medicine';
    const group = this.fb.group({
      type: [type, Validators.required], // 'medicine' | 'equipment'
      idPrescriptionDetail: [0],

      // Medicamento
      idMedicine: [null, isMedicine ? Validators.required : []],
      medicineName: [''],
      dosage: [isMedicine ? '' : null, isMedicine ? Validators.required : []],
      frequency: [isMedicine ? '' : null, isMedicine ? Validators.required : []],
      duration: [isMedicine ? '' : null, isMedicine ? Validators.required : []],
      quantity: [isMedicine ? '' : null, isMedicine ? Validators.required : []],

      // Equipo
      idMedicalEquipment: [null, !isMedicine ? Validators.required : []],
      equipmentName: [''],

      // Común
      instructions: ['']
    });

    return group;
  }

  addMedicationDetail() {
    const group = this.createDetailGroup('medicine');
    this.details.push(group);
    this._initArraysForIndex(this.details.length - 1);
  }

  addEquipmentDetail() {
    const group = this.createDetailGroup('equipment');
    this.details.push(group);
    this._initArraysForIndex(this.details.length - 1);
  }

  private _initArraysForIndex(i: number) {
    // medicinas
    this.medicinesSuggestions[i] = [];
    this.showMedicinesDropdown[i] = false;
    this.medicinesPaginator[i] = { pageIndex: 1, pageSize: 10 };
    this.totalPagesByDetail[i] = 1;

    // equipos
    this.equipmentSuggestions[i] = [];
    this.showEquipmentsDropdown[i] = false;
    this.equipmentsPaginator[i] = { pageIndex: 1, pageSize: 10 };
  }

  removeDetail(index: number) {
    this.details.removeAt(index);
    // limpiar arrays paralelos
    this.medicinesSuggestions.splice(index, 1);
    this.showMedicinesDropdown.splice(index, 1);
    this.medicinesPaginator.splice(index, 1);
    this.totalPagesByDetail.splice(index, 1);

    this.equipmentSuggestions.splice(index, 1);
    this.showEquipmentsDropdown.splice(index, 1);
    this.equipmentsPaginator.splice(index, 1);
  }

  /** ---------- AUTOCOMPLETE MEDS ---------- */
  /* onMedicineInput(value: string, index: number) {
    if (value && value.trim().length >= 2) {
      const term = value.trim();
      this.medicinesPaginator[index].pageIndex = 1;
      this.searchMedicines(term, index);
    } else {
      this.medicinesSuggestions[index] = [];
      this.showMedicinesDropdown[index] = false;
    }
  } */

  onMedicineInput(value: string, index: number) {
    const group = this.details.at(index) as FormGroup;

    if (!value || value.trim().length === 0) {
      group.get('idMedicine')?.setValue(null);
      this.medicinesSuggestions[index] = [];
      this.showMedicinesDropdown[index] = false;
      return;
    }

    if (value.trim().length >= 2) {
      const term = value.trim();
      this.medicinesPaginator[index].pageIndex = 1;
      this.searchMedicines(term, index);
    } else {
      this.medicinesSuggestions[index] = [];
      this.showMedicinesDropdown[index] = false;
    }
  }


  searchMedicines(term: string, index: number) {
    const paginator = this.medicinesPaginator[index];

    this.medicineUseCase
      .GetListMedicines(paginator, term, term)
      .subscribe({
        next: (data: TableResultDTO) => {
          const results = data?.results || [];
          this.medicinesSuggestions[index] = results;
          this.showMedicinesDropdown[index] = results.length > 0;

          const totalCount = data.totalRecords || 0;
          this.totalPagesByDetail[index] = Math.ceil(totalCount / paginator.pageSize);
          this.cdr.detectChanges();
        },
        error: () => {
          this.medicinesSuggestions[index] = [];
          this.showMedicinesDropdown[index] = false;
          this.totalPagesByDetail[index] = 1;
        }
      });
  }

  previousPage(index: number) {
    if (this.medicinesPaginator[index].pageIndex > 1) {
      this.medicinesPaginator[index].pageIndex--;
      const value = this.details.at(index).get('medicineName')?.value || '';
      this.searchMedicines(value, index);
    }
  }

  nextPage(index: number) {
    if (this.medicinesPaginator[index].pageIndex < this.totalPagesByDetail[index]) {
      this.medicinesPaginator[index].pageIndex++;
      const value = this.details.at(index).get('medicineName')?.value || '';
      this.searchMedicines(value, index);
    }
  }

  selectMedicine(med: MedicineDTO, index: number) {
    const group = this.details.at(index) as FormGroup;
    group.get('idMedicine')?.setValue(med.idMedicine);
    group.get('medicineName')?.setValue(`${med.commercialName} - ${med.activeIngredient}`);
    this.medicinesSuggestions[index] = [];
    this.showMedicinesDropdown[index] = false;
  }

  onMedicineNameManualEdit(value: string, index: number) {
    const group = this.details.at(index) as FormGroup;

    // Si ya hay un medicamento seleccionado, NO lo limpiamos
    if (group.get('idMedicine')?.value) {
      // Solo actualizamos el texto, no el id
      group.get('medicineName')?.setValue(value, { emitEvent: false });
    }
  }


  /** ---------- AUTOCOMPLETE EQUIPOS ---------- */
  onEquipmentInput(value: string, index: number) {
    if (value && value.trim().length >= 2) {
      const term = value.trim();
      this.equipmentsPaginator[index].pageIndex = 1;
      this.searchEquipments(term, index);
    } else {
      this.equipmentSuggestions[index] = [];
      this.showEquipmentsDropdown[index] = false;
    }
  }

  searchEquipments(term: string, index: number) {
    const paginator = this.equipmentsPaginator[index];

    this._medicalEquipmentsUseCase.GetListMedicalEquipment(paginator)
      .subscribe({
        next: (data: TableResultDTO) => {
          // Si el endpoint no filtra por término, filtramos en cliente:
          const results = (data?.results || []).filter((eq: MedicalEquipmentDTO) =>
            (eq.equipmentName || '').toLowerCase().includes(term.toLowerCase()) ||
            (eq.brand || '').toLowerCase().includes(term.toLowerCase())
          );
          this.equipmentSuggestions[index] = results;
          this.showEquipmentsDropdown[index] = results.length > 0;
          this.cdr.detectChanges();
        },
        error: () => {
          this.equipmentSuggestions[index] = [];
          this.showEquipmentsDropdown[index] = false;
        }
      });
  }

  selectEquipment(eq: MedicalEquipmentDTO, index: number) {
    const group = this.details.at(index) as FormGroup;
    group.get('idMedicalEquipment')?.setValue(eq.idMedicalEquipment);
    group.get('equipmentName')?.setValue(`${eq.equipmentName} - ${eq.brand}`);
    this.equipmentSuggestions[index] = [];
    this.showEquipmentsDropdown[index] = false;
  }

  /** ---------- SUBMIT (mezclado) ---------- */
  onSubmit() {

    /* console.log('📌 FORM VALUE:', this.prescriptionForm.value);
    console.log('📌 FORM STATUS:', this.prescriptionForm.status);
    console.log('📌 DETAILS ARRAY:', this.details.value);

    console.log('consultationData', this.consultationData) */

    this.submitted = true;


    if (this.prescriptionForm.invalid) {
      this.prescriptionForm.markAllAsTouched();
      return;
    }

    const isEditing = !!this.prescriptionToEdit;
    const baseIdPrescription = this.prescriptionToEdit?.idPrescription ?? 0;

    // Construimos DTO por ítem según type
    const details: PrescriptionDetailDTO[] = this.details.value.map((d: any) => {
      if (d.type === 'medicine') {
        return {
          idPrescriptionDetail: d.idPrescriptionDetail || 0,
          idPrescription: baseIdPrescription,
          idMedicine: d.idMedicine,
          idMedicalEquipment: null,
          dosage: d.dosage,
          frequency: d.frequency,
          duration: d.duration,
          quantity: d.quantity,
          prescribedQuantity: 0,
          instructions: d.instructions,
          updatedByUserId: this.consultationData.idUser,
          updatedAt: DateTimeHelper.getLocalDateTimeWithOffset(),
          registeredByUser: this.consultationData.idUser,
          registeredAt: DateTimeHelper.getLocalDateTimeWithOffset(),
        } as PrescriptionDetailDTO;
      } else {
        // Equipo: solo idPrescriptionDetail, instructions, idMedicalEquipment (lo demás vacío/cero)
        return {
          idPrescriptionDetail: d.idPrescriptionDetail || 0,
          idPrescription: baseIdPrescription,
          idMedicine: null,
          idMedicalEquipment: d.idMedicalEquipment,
          dosage: null,
          frequency: null,
          duration: null,
          quantity: null,
          prescribedQuantity: 0,
          instructions: d.instructions,
          //updatedByUserId: this.consultationData.idUser,
          updatedByUserId: this.consultationData?.idUser || 0,
          updatedAt: DateTimeHelper.getLocalDateTimeWithOffset(),
          //registeredByUser: this.consultationData.idUser,
          registeredByUser: this.consultationData?.idUser || 0,
          registeredAt: DateTimeHelper.getLocalDateTimeWithOffset(),
        } as PrescriptionDetailDTO;
      }
    });

    //console.log('📌 DTO FINAL PARA ENVIAR:', details);

    if (isEditing) {
      // Update/Create por ítem según tenga idPrescriptionDetail
      const requests = details.map(detail =>
        detail.idPrescriptionDetail
          ? this.prescriptionDetailsUseCase.UpdatePrescriptionDetails(detail)
          : this.prescriptionDetailsUseCase.CreatePrescriptionDetails(detail)
      );

      forkJoin(requests).subscribe({
        next: () => { this.onClose.emit('refresh'); this.bsModalRef.hide(); },
        error: (err) => console.error('Error actualizando detalles', err)
      });

    } else {
      // Crear cabecera y luego detalles (mezclados)
      const header: PrescriptionDTO = {
        idPrescription: 0,
        idMedicalConsultation: this.consultationData.idMedicalConsultation,
        idPatient: this.consultationData.idPatient,
        idUser: this.consultationData.idUser,
        prescriptionDate: DateTimeHelper.getLocalDateTimeWithOffset(),
        isActive: true
      };

      //console.log("CONSULTATION DATA:", header);


      this.prescriptionsUseCase.CreatePrescription(header).subscribe({
        next: (res) => {
          if (res.isSuccess) {
            const newId = res.data.idPrescription;

            const requests = details.map(d => {
              d.idPrescription = newId;
              return this.prescriptionDetailsUseCase.CreatePrescriptionDetails(d);
            });

            forkJoin(requests).subscribe({
              next: () => { this.onClose.emit('refresh'); this.bsModalRef.hide(); },
              error: (err) => console.error('Error creando detalles', err)
            });
          } else {
            console.error('Error creando prescripción');
          }
        },
        error: (err) => console.error('Error creando prescripción', err)
      });
    }
  }

  close() {
    this.bsModalRef.hide();
  }
}
