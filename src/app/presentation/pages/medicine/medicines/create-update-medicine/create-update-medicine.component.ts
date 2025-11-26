import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { MedicineDTO } from 'src/app/core/DTOs/app/medicine.dto';
import { MedicineUseCase } from 'src/app/infrastructure/use-cases/app/medicine.use-case';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgSelectModule
  ],
  selector: 'app-create-update-medicine',
  templateUrl: './create-update-medicine.component.html',
  styleUrl: './create-update-medicine.component.css'
})
export class CreateUpdateMedicineComponent implements OnInit {

  medicineForm!: FormGroup;
  submitted = false;

  // para cerrar el modal desde el padre
  onClose: (result: string) => void = () => { };

  medicineData?: MedicineDTO;
  isEditMode: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private medicineUseCase: MedicineUseCase,
    private router: Router,
    public bsModalRef: BsModalRef,
  ) {}

  ngOnInit(): void {
    this.initForm();

    // Si viene data, entramos en modo edición
    if (this.medicineData) {
      this.isEditMode = true;
      this.medicineForm.patchValue(this.medicineData);
    }
  }

  private initForm(): void {
    this.medicineForm = this.formBuilder.group({
      idMedicine: [0],
      idCompany: [Number(localStorage.getItem('IdCompany')) || 0],
      commercialName: [''],
      activeIngredient: ['', Validators.required],
      pharmaceuticalForm: [''],
      concentration: [''],
      presentation: [''],
      unitOfMeasure: [''],
      currentStock: [0],
      minimumStock: [0],
      unitPrice: [0],
      batch: [''],
      expirationDate: [null],
      supplier: [''],
      isActive: [true],
      registrationDate: [new Date()],
      registeredByUser: [Number(localStorage.getItem('IdUser')) || 0],
    });
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.medicineForm.invalid) {
      this.medicineForm.markAllAsTouched();
      return;
    }

    const medicineData: MedicineDTO = {
      ...this.medicineForm.value,
      idMedicine: this.isEditMode ? this.medicineData!.idMedicine : 0
    };

    const operation = this.isEditMode
      ? this.medicineUseCase.UpdateMedicine(medicineData)
      : this.medicineUseCase.CreateMedicine(medicineData);

    operation.subscribe({
      next: () => {
        this.router.navigate(['/medicines/list-medicines']);
        this.onClose('refresh');
        this.bsModalRef.hide();
      },
      error: (err) => {
        console.error('❌ Error al guardar el medicamento:', err);
      }
    });
  }

  onCancel(): void {
    this.bsModalRef.hide();
  }
}
