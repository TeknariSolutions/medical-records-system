import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { MedicalEquipmentDTO } from 'src/app/core/DTOs/app/medical-equipment.dto';
import { MedicalEquipmentsUseCase } from 'src/app/infrastructure/use-cases/app/medical-equipment.use.case';
import { DateTimeHelper } from 'src/app/infrastructure/helpers/date-time.helper';

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
  ) { }

  ngOnInit(): void {
    this.initForm();

    if (this.equipmentData) {
      this.isEditMode = true;

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

      // Limpia campos nulos que invalidan el formulario
      Object.keys(this.equipmentForm.controls).forEach((key) => {
        const control = this.equipmentForm.get(key);
        if (control?.value === null) {
          control.setValue(''); // o un valor por defecto
        }
        control?.updateValueAndValidity();
      });

      this.equipmentForm.updateValueAndValidity();

    }
  }

  private initForm(): void {
    this.equipmentForm = this.fb.group({
      idMedicalEquipment: [0],
      equipmentName: ['', Validators.required],
      description: [''],
      brand: [''],
      currentStock: [0],
      minimumStock: [0],
      unitPrice: [0],
      supplier: [''],
      acquisitionDate: [null],
      expirationDate: [null],
      isActive: [true],
      registrationDate: [new Date().toISOString()],
      //registeredByUser: [Number(localStorage.getItem('IdUser')) || 0, Validators.required],
      idCompany: [Number(localStorage.getItem('IdCompany')) || 0, Validators.required]
    });
  }

 
  onSubmit(): void {
    this.submitted = true;

    if (this.equipmentForm.invalid) {
      this.equipmentForm.markAllAsTouched();
      return;
    }

    const now = DateTimeHelper.getLocalDateTimeWithOffset();
    const currentUserId = Number(localStorage.getItem('IdUser')) || 0;
    const companyId = Number(localStorage.getItem('IdCompany')) || 0;
    const formValue = this.equipmentForm.value;

    const dto: MedicalEquipmentDTO = {
      idMedicalEquipment: this.isEditMode ? this.equipmentData!.idMedicalEquipment : 0,
      equipmentName: formValue.equipmentName,
      description: formValue.description || '',
      brand: formValue.brand,
      currentStock: formValue.currentStock,
      minimumStock: formValue.minimumStock,
      unitPrice: formValue.unitPrice,
      supplier: formValue.supplier,
      //acquisitionDate: `${formValue.acquisitionDate}T00:00:00`,
      acquisitionDate: formValue.acquisitionDate,
      //expirationDate: `${formValue.expirationDate}T00:00:00`,
      expirationDate: formValue.expirationDate,
      isActive: formValue.isActive,
      registrationDate: this.equipmentData?.registrationDate ?? now,
      ...(this.isEditMode ? {} : { registeredByUser: currentUserId }),
      idCompany: companyId
    };


    const request$ = this.isEditMode
      ? this._medicalEquipmentsUseCase.UpdateMedicalEquipment(dto)
      : this._medicalEquipmentsUseCase.CreateMedicalEquipment(dto);

    request$.subscribe({
      next: () => {
        this.onClose('refresh');
        this.bsModalRef.hide();
      },
      error: (err) => console.error('❌ Error al guardar equipo médico:', err)
    });
  }


  onCancel(): void {
    this.bsModalRef.hide();
  }
}
