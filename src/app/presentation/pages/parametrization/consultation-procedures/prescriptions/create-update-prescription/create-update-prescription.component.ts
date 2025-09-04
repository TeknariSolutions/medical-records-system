import { CommonModule } from '@angular/common';
import { Component, Input, EventEmitter, Output, ChangeDetectorRef, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { PrescriptionsUseCase } from 'src/app/infrastructure/use-cases/app/prescriptions.use-case';
import { PrescriptionDetailsUseCase } from 'src/app/infrastructure/use-cases/app/prescription-details.use-case';
import { PrescriptionDTO } from 'src/app/core/DTOs/app/prescription.dto';
import { PrescriptionDetailDTO } from 'src/app/core/DTOs/app/prescription-details.dto';
import { MedicalConsultationDTO } from 'src/app/core/DTOs/app/medical-consultation.dto';
import { debounceTime, forkJoin, switchMap } from 'rxjs';
import { MedicineDTO } from 'src/app/core/DTOs/app/medicine.dto';
import { PaginatorDTO } from 'src/app/core/DTOs/common/paginator/paginator.dto';
import { MedicineUseCase } from 'src/app/infrastructure/use-cases/app/medicine.use-case';
import { TableResultDTO } from 'src/app/core/DTOs/common/table-result/table-result.dto';


@Component({
  selector: 'app-create-update-prescription',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-update-prescription.component.html',
  styleUrl: './create-update-prescription.component.css'
})
export class CreateUpdatePrescriptionComponent implements OnInit {

  @Input() consultationData!: MedicalConsultationDTO; // 👈 llega del padre
  @Output() onClose = new EventEmitter<string>();

  prescriptionForm!: FormGroup;

  medicines: MedicineDTO[] = [];
  searchControl = new FormControl('');


  medicinesSuggestions: MedicineDTO[][] = [];
  showMedicinesDropdown: boolean[] = [];
  paginator: PaginatorDTO = { pageIndex: 1, pageSize: 20 };

  constructor(
    private fb: FormBuilder,
    private prescriptionsUseCase: PrescriptionsUseCase,
    private prescriptionDetailsUseCase: PrescriptionDetailsUseCase,
    private medicineUseCase: MedicineUseCase,
    public bsModalRef: BsModalRef,
    private cdr: ChangeDetectorRef,
  ) {}


  ngOnInit(): void {
    this.prescriptionForm = this.fb.group({
      generalObservations: ['', Validators.required],
      details: this.fb.array([])
    });
    this.addDetail();
  }

  get details(): FormArray {
    return this.prescriptionForm.get('details') as FormArray;
  }


  addDetail() {
    const detail = this.fb.group({
      idMedicine: [null, Validators.required],
      medicineName: [''], // para mostrar en input
      dosage: ['', Validators.required],
      frequency: ['', Validators.required],
      duration: ['', Validators.required],
      prescribedQuantity: [0, Validators.required],
      instructions: ['']
    });
    this.details.push(detail);
    this.medicinesSuggestions.push([]);
    this.showMedicinesDropdown.push(false);
  }

  removeDetail(index: number) {
    this.details.removeAt(index);
    this.medicinesSuggestions.splice(index, 1);
    this.showMedicinesDropdown.splice(index, 1);
  }

  onMedicineInput(value: string, index: number) {
    if (value && value.length >= 2) {
      this.searchMedicines(value, index);
    } else {
      this.medicinesSuggestions[index] = [];
      this.showMedicinesDropdown[index] = false;
    }
  }

  searchMedicines(term: string, index: number) {
    this.medicineUseCase
      .GetListMedicines(this.paginator, term, term)
      .subscribe({
        next: (data: TableResultDTO) => {
          const results = data?.results || [];
          this.medicinesSuggestions[index] = results;
          this.showMedicinesDropdown[index] = results.length > 0;
          this.cdr.detectChanges();
        },
        error: () => {
          this.medicinesSuggestions[index] = [];
          this.showMedicinesDropdown[index] = false;
        }
      });
  }

  selectMedicine(med: MedicineDTO, index: number) {
    const group = this.details.at(index) as FormGroup;
    group.get('idMedicine')?.setValue(med.idMedicine);
    group.get('medicineName')?.setValue(`${med.commercialName} - ${med.activeIngredient}`);
    this.medicinesSuggestions[index] = [];
    this.showMedicinesDropdown[index] = false;
  }

  onSubmit() {
  if (this.prescriptionForm.invalid) {
    this.prescriptionForm.markAllAsTouched();
    return;
  }

  const prescriptionData: PrescriptionDTO = {
    idPrescription: 0,
    idMedicalConsultation: this.consultationData.idMedicalConsultation,
    idPatient: this.consultationData.idPatient,
    idUser: this.consultationData.idUser,
    prescriptionDate: new Date(),
    generalObservations: this.prescriptionForm.value.generalObservations,
    isActive: true
  };

  this.prescriptionsUseCase.CreatePrescription(prescriptionData).subscribe({
    next: (res) => {
      if (res.isSuccess) {
        const idPrescription = res.data.idPrescription;

        const details: PrescriptionDetailDTO[] = this.details.value.map((d: any) => ({
          idPrescriptionDetail: 0,
          idPrescription,
          idMedicine: d.idMedicine,
          dosage: d.dosage,
          frequency: d.frequency,
          duration: d.duration,
          prescribedQuantity: d.prescribedQuantity,
          instructions: d.instructions,
          updatedByUserId: this.consultationData.idUser,
          updatedAt: new Date().toISOString(),
          registeredByUser: this.consultationData.idUser,
          registeredAt: new Date().toISOString()
        }));

        // 🔹 Esperar a que todas las llamadas terminen
        const requests = details.map(detail =>
          this.prescriptionDetailsUseCase.CreatePrescriptionDetails(detail)
        );

        forkJoin(requests).subscribe({
          next: () => {
            // ✅ Cuando todas las peticiones terminen, cierro modal
            this.onClose.emit('refresh');
            this.bsModalRef.hide();
          },
          error: (err) => {
            console.error("Error creando detalles", err);
          }
        });
      }
    }
  });
}

}
