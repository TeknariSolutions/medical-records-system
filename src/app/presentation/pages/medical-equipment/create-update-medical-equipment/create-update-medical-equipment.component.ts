import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { MedicalEquipmentDTO } from 'src/app/core/DTOs/app/medical-equipment.dto';
import { MedicalEquipmentsUseCase } from 'src/app/infrastructure/use-cases/app/medical-equipment.use.case';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  selector: 'app-create-update-medical-equipment',
  templateUrl: './create-update-medical-equipment.component.html',
  styleUrl: './create-update-medical-equipment.component.css'
})
export class CreateUpdateMedicalEquipmentComponent implements OnInit {

  equipmentForm!: FormGroup;
  submitted = false;

  onClose: (result: string) => void = () => { };

  equipmentData?: MedicalEquipmentDTO;
  isEditMode: boolean = false;

  constructor(
    private fb: FormBuilder,
    private _medicalEquipmentsUseCase: MedicalEquipmentsUseCase,
    public bsModalRef: BsModalRef
  ) {}

  ngOnInit(): void {
    this.initForm();

    // Si hay data, es modo edición
    if (this.equipmentData) {
      this.isEditMode = true;

      // Convertir fechas a formato ISO corto (yyyy-MM-dd)
      const acquisitionDate = this.equipmentData.acquisitionDate
        ? this.equipmentData.acquisitionDate.split('T')[0]
        : '';
      const expirationDate = this.equipmentData.expirationDate
        ? this.equipmentData.expirationDate.split('T')[0]
        : '';

      this.equipmentForm.patchValue({
        ...this.equipmentData,
        acquisitionDate,
        expirationDate
      });
    }

  }

  private initForm(): void {
    this.equipmentForm = this.fb.group({
      idMedicalEquipment: [0],
      equipmentName: ['', Validators.required],
      description: [''],
      brand: ['', Validators.required],
      currentStock: [0, [Validators.required, Validators.min(0)]],
      minimumStock: [0, [Validators.required, Validators.min(0)]],
      unitPrice: [0, [Validators.required, Validators.min(0)]],
      supplier: ['', Validators.required],
      acquisitionDate: ['', Validators.required],
      expirationDate: ['', Validators.required],
      isActive: [true],
      registrationDate: [new Date().toISOString()],
      registeredByUser: [Number(localStorage.getItem('IdUser')) || 0, Validators.required],
      idCompany: [Number(localStorage.getItem('IdCompany')) || 0, Validators.required]
    });
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.equipmentForm.invalid) {
      this.equipmentForm.markAllAsTouched();
      return;
    }

    const equipmentData: MedicalEquipmentDTO = {
      ...this.equipmentForm.value,
      idMedicalEquipment: this.isEditMode ? this.equipmentData!.idMedicalEquipment : 0
    };

    const request$ = this.isEditMode
      ? this._medicalEquipmentsUseCase.UpdateMedicalEquipment(equipmentData)
      : this._medicalEquipmentsUseCase.CreateMedicalEquipment(equipmentData);

    request$.subscribe({
      next: () => {
        this.onClose('refresh');
        this.bsModalRef.hide();
      },
      error: (err) => {
        console.error('❌ Error al guardar equipo médico:', err);
      }
    });
  }

  onCancel(): void {
    this.bsModalRef.hide();
  }
}
