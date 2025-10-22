import { CommonModule } from '@angular/common';
import { Component, Input, EventEmitter, Output, ChangeDetectorRef, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { PrescriptionsUseCase } from 'src/app/infrastructure/use-cases/app/prescriptions.use-case';
import { PrescriptionDetailsUseCase } from 'src/app/infrastructure/use-cases/app/prescription-details.use-case';
import { PrescriptionDTO } from 'src/app/core/DTOs/app/prescription.dto';
import { PrescriptionDetailDTO } from 'src/app/core/DTOs/app/prescription-details.dto';
import { MedicalConsultationDTO } from 'src/app/core/DTOs/app/medical-consultation.dto';
import { debounceTime, forkJoin, map, Observable, switchMap } from 'rxjs';
import { MedicineDTO } from 'src/app/core/DTOs/app/medicine.dto';
import { PaginatorDTO } from 'src/app/core/DTOs/common/paginator/paginator.dto';
import { MedicineUseCase } from 'src/app/infrastructure/use-cases/app/medicine.use-case';
import { TableResultDTO } from 'src/app/core/DTOs/common/table-result/table-result.dto';
import { DateTimeHelper } from 'src/app/infrastructure/helpers/date-time.helper';



@Component({
  selector: 'app-create-update-prescription',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-update-prescription.component.html',
  styleUrl: './create-update-prescription.component.css'
})
export class CreateUpdatePrescriptionComponent implements OnInit {

  @Input() consultationData!: MedicalConsultationDTO; 
  @Output() onClose = new EventEmitter<string>();
  @Input() prescriptionToEdit?: PrescriptionDTO;


  prescriptionForm!: FormGroup;

  medicines: MedicineDTO[] = [];
  searchControl = new FormControl('');

  medicinesSuggestions: MedicineDTO[][] = [];
  showMedicinesDropdown: boolean[] = [];
  paginator: PaginatorDTO = { pageIndex: 1, pageSize: 10 };

  medicinesPaginator: PaginatorDTO[] = [];

  pageSize: number = 10;
  pageSizeOptions = [5, 10, 25, 100];
  totalRecords: number = 0;
 
  totalPagesByDetail: number[] = [];

  constructor(
    private fb: FormBuilder,
    private prescriptionsUseCase: PrescriptionsUseCase,
    private prescriptionDetailsUseCase: PrescriptionDetailsUseCase,
    private medicineUseCase: MedicineUseCase,
    public bsModalRef: BsModalRef,
    private cdr: ChangeDetectorRef,
    //private DateTimeHelper: DateTimeHelper
  ) {}

  ngOnInit(): void {
    this.prescriptionForm = this.fb.group({
      details: this.fb.array([])
    });

    if (this.prescriptionToEdit) {
      this.loadPrescriptionDetails(this.prescriptionToEdit.idPrescription);
    } else {
      this.addDetail();
    }
  }
    
  loadPrescriptionDetails(idPrescription: number) {
    this.prescriptionDetailsUseCase.GetPrescriptionDetailsByIdPrescription(idPrescription)
      .subscribe((tableResult: PrescriptionDetailDTO[]) => {
        tableResult.forEach(d => {
          this.medicineUseCase.GetMedicineById(d.idMedicine).subscribe(med => {
            const detailGroup = this.fb.group({
              idPrescriptionDetail: [d.idPrescriptionDetail],
              idMedicine: [d.idMedicine, Validators.required],
              medicineName: [`${med[0].commercialName} - ${med[0].activeIngredient}`],
              dosage: [d.dosage, Validators.required],
              frequency: [d.frequency, Validators.required],
              duration: [d.duration, Validators.required],
              //prescribedQuantity: [d.prescribedQuantity, Validators.required],
              instructions: [d.instructions],
              idMedicalEquipment: 1
            });
            this.details.push(detailGroup);
            this.medicinesSuggestions.push([]);
            this.showMedicinesDropdown.push(false);
            this.medicinesPaginator.push({ pageIndex: 1, pageSize: 10 });
            this.totalPagesByDetail.push(1);

          });
        });
      });
  } 

searchMedicineById(idMedicine: number): Observable<any | undefined> {
  const paginator = { pageIndex: 1, pageSize: 1 }; // solo necesitamos 1 resultado
  return this.medicineUseCase.GetListMedicines(paginator, '', '').pipe(
    map((tableResult: any) => {
      return tableResult.results?.find(m => m.idMedicine === idMedicine);
    })
  );
} 

  get details(): FormArray {
    return this.prescriptionForm.get('details') as FormArray;
  }


 addDetail() {
  const detail = this.fb.group({
    idMedicine: [null, Validators.required],
    medicineName: [''],
    dosage: ['', Validators.required],
    frequency: ['', Validators.required],
    duration: ['', Validators.required],
    //prescribedQuantity: [0, Validators.required],
    instructions: ['']
  });
  this.details.push(detail);
  this.medicinesSuggestions.push([]);
  this.showMedicinesDropdown.push(false);

  // Inicializa el paginador para este detalle
  this.medicinesPaginator.push({ pageIndex: 1, pageSize: 10 });
  this.totalPagesByDetail.push(1); // inicializamos en 1
}

  removeDetail(index: number) {
    this.details.removeAt(index);
    this.medicinesSuggestions.splice(index, 1);
    this.showMedicinesDropdown.splice(index, 1);
  }


  onMedicineInput(value: string, index: number) {
  if (value && value.trim().length >= 2) {
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

        // Guardamos totalPages en arreglo paralelo
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

    // limpiar sugerencias
    this.medicinesSuggestions[index] = [];
    this.showMedicinesDropdown[index] = false;
  }


  onSubmit() {
  if (this.prescriptionForm.invalid) {
    this.prescriptionForm.markAllAsTouched();
    return;
  }

  // Caso: edición de prescripción existente
  if (this.prescriptionToEdit) {
    const details: PrescriptionDetailDTO[] = this.details.value.map((d: any) => ({
      idPrescriptionDetail: d.idPrescriptionDetail || 0,
      idPrescription: this.prescriptionToEdit!.idPrescription,
      idMedicine: d.idMedicine,
      dosage: d.dosage,
      frequency: d.frequency,
      duration: d.duration,
      prescribedQuantity: d.prescribedQuantity,
      instructions: d.instructions,
      updatedByUserId: this.consultationData.idUser,
      updatedAt: DateTimeHelper.getLocalDateTimeWithOffset(),
      registeredByUser: this.consultationData.idUser,
      registeredAt: DateTimeHelper.getLocalDateTimeWithOffset(),
      idMedicalEquipment: 1
      
    }));

    const requests = details.map(detail =>
      detail.idPrescriptionDetail
        ? this.prescriptionDetailsUseCase.UpdatePrescriptionDetails(detail)
        : this.prescriptionDetailsUseCase.CreatePrescriptionDetails(detail)
    );

    forkJoin(requests).subscribe({
      next: () => {
        this.onClose.emit('refresh');
        this.bsModalRef.hide();
      },
      error: (err) => {
        console.error("Error creando/actualizando detalles", err);
      }
    });

  } else {
    // Caso: nueva prescripción
    const prescriptionData: PrescriptionDTO = {
      idPrescription: 0,
      idMedicalConsultation: this.consultationData.idMedicalConsultation,
      idPatient: this.consultationData.idPatient,
      idUser: this.consultationData.idUser,
      prescriptionDate: DateTimeHelper.getLocalDateTimeWithOffset(),
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
            updatedAt: DateTimeHelper.getLocalDateTimeWithOffset(),
            registeredByUser: this.consultationData.idUser,
            registeredAt: DateTimeHelper.getLocalDateTimeWithOffset(),
            idMedicalEquipment: 1
          }));

          const requests = details.map(detail =>
            this.prescriptionDetailsUseCase.CreatePrescriptionDetails(detail)
          );

          forkJoin(requests).subscribe({
            next: () => {
              this.onClose.emit('refresh');
              this.bsModalRef.hide();
            },
            error: (err) => {
              console.error("Error creando detalles", err);
            }
          });

        } else {
          console.error("Error creando prescripción");
        }
      },
      error: (err) => console.error("Error creando prescripción", err)
    });
  }
}


  close() {
    this.bsModalRef.hide();
  }

}
