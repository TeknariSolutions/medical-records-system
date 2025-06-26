import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MedicalConsultationDTO } from 'src/app/core/DTOs/app/medical-consultation.dto';
import { MedicalDiagnosisDTO } from 'src/app/core/DTOs/app/medical-diagnosis.dto';
import { Cie10Service } from 'src/app/infrastructure/services/common/CIE10/cie10.service';
import { MedicalConsultationUseCase } from 'src/app/infrastructure/use-cases/app/medical-consultation.use-case';

@Component({
  selector: 'app-create-update-medical-consultation',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule,
    FormsModule 
  ],
  templateUrl: './create-update-medical-consultation.component.html',
  styleUrl: './create-update-medical-consultation.component.css'
})
export class CreateUpdateMedicalConsultationComponent {

  @Input() idPatient!: number;
  @Output() backToList = new EventEmitter<void>();
  @Input() consultationToEdit?: MedicalConsultationDTO;

 form: FormGroup;

 //diagnoses: MedicalDiagnosisDTO[] = [];
 showDiagnosisSection = false;

 //cie10Results: any[] = [];

 cie10Results: any[][] = []; // Una lista por cada diagnóstico
 showSuggestions: boolean[] = []; // Controlar visibilidad individual de sugerencias


   constructor(
    private fb: FormBuilder,
    private _medicalConsultationUseCase: MedicalConsultationUseCase,
    private cie10Service: Cie10Service
  ) {
    this.form = this.fb.group({
      consultationReason: ['', Validators.required],
      consultationDate: [new Date(), Validators.required],

      vitalSigns_BP: [''],
      vitalSigns_HR: [null],
      vitalSigns_RR: [null],
      vitalSigns_Temp: [null],
      vitalSigns_SPO2: [null],

      physicalExam_HeadNeck: [''],
      physicalExam_Chest: [''],
      physicalExam_Heart: [''],
      physicalExam_Abdomen: [''],
      physicalExam_GU: [''],
      physicalExam_Musculoskeletal: [''],
      physicalExam_Neuro: [''],
      physicalExam_Skin: [''],

      observations: [''],
      status: ['Pendiente'],
      isFirstTime: [true]
    });
  }

  onSearchCie10(term: string) {
    if (term.length < 3) return;

    /*  this.cie10Service.searchCodes(term).subscribe({
       next: (res) => {
         this.cie10Results = res.destinations || [];
       },
       error: (err) => {
         console.error('Error al buscar CIE-10:', err);
       }
     }); */
    this.cie10Service.searchCodes('asma').subscribe(data => {
      console.log('Resultados:', data);
    });

  }

  onDiagnosisSearch(term: string, index: number): void {
    if (term.length < 3) {
      this.cie10Results[index] = [];
      return;
    }

    this.cie10Service.searchCodes(term).subscribe((results: any) => {
      this.cie10Results[index] = results;
    });
  }

  selectDiagnosis(option: any, index: number): void {
    const diagnosisGroup = this.form.get('diagnoses')?.get(`${index}`);
    if (!diagnosisGroup) return;

    diagnosisGroup.patchValue({
      diagnosisCode: option.code,
      diagnosisDescription: option.title?.value
    });

    this.showSuggestions[index] = false;
  }




  /* ngOnInit(): void {
    if (this.consultationToEdit) {
      this.form.patchValue(this.consultationToEdit);
    }
  } */

   /* ngOnInit(): void {
    const idRol = parseInt(localStorage.getItem('IdRol') || '0', 10);
    this.showDiagnosisSection = idRol === 1;

    if (this.consultationToEdit) {
      this.form.patchValue(this.consultationToEdit);
    }
  } */

  /* ngOnInit(): void {
    const idRol = parseInt(localStorage.getItem('IdRol') || '0', 10);
    if (idRol === 1) {
      this.form.addControl('diagnoses', this.fb.array([]));
      this.addDiagnosis(); // agrega uno por defecto si quieres
    }

    if (this.consultationToEdit) {
      this.form.patchValue(this.consultationToEdit);

      // Si hay diagnósticos en edición
      if (idRol === 1 && this.consultationToEdit.diagnoses) {
        this.consultationToEdit.diagnoses.forEach(d => {
          const group = this.createDiagnosisGroup();
          group.patchValue(d);
          this.diagnoses.push(group);
        });
      }
    }
  } */

    ngOnInit(): void {
  const idRol = parseInt(localStorage.getItem('IdRol') || '0', 10);

  // Solo si el usuario es administrador (rol 1)
  if (idRol === 1 && !this.form.contains('diagnoses')) {
    this.form.addControl('diagnoses', this.fb.array([]));
    this.addDiagnosis(); // Opcional: agrega un grupo por defecto
  }

  if (this.consultationToEdit) {
    this.form.patchValue(this.consultationToEdit);

    if (idRol === 1 && this.consultationToEdit.diagnoses) {
      const array = this.form.get('diagnoses') as FormArray;
      this.consultationToEdit.diagnoses.forEach(d => {
        const group = this.createDiagnosisGroup();
        group.patchValue(d);
        array.push(group);
      });
    }
  }
}



  get diagnoses(): FormArray {
    return this.form.get('diagnoses') as FormArray;
  }

  private createDiagnosisGroup(): FormGroup {
    return this.fb.group({
      diagnosisCode: ['', Validators.required],
      diagnosisDescription: ['', Validators.required],
      diagnosisType: [''],
      isPrincipal: [false],
      comment: [''],
      createdBy: [0]
    });
  }

 /*  addDiagnosis(): void {
    this.diagnoses.push(this.createDiagnosisGroup());
  } */

  addDiagnosis(): void {
    this.diagnoses.push(this.createDiagnosisGroup());

    // 🔧 Agrega una lista vacía para resultados de búsqueda y sugerencias
    this.cie10Results.push([]);
    this.showSuggestions.push(false);
  }


  /* removeDiagnosis(index: number): void {
    this.diagnoses.removeAt(index);
  } */

  removeDiagnosis(index: number): void {
    this.diagnoses.removeAt(index);

    // 🔧 Elimina también sus sugerencias y estado visual
    this.cie10Results.splice(index, 1);
    this.showSuggestions.splice(index, 1);
  }


  /* addDiagnosis() {
    const diagnosis: MedicalDiagnosisDTO = {
      diagnosisCode: '',
      diagnosisDescription: '',
      diagnosisType: '',
      isPrincipal: false,
      comment: '',
      createdBy: parseInt(localStorage.getItem('IdUser') || '0', 10)
    };
    this.diagnoses.push(diagnosis);
  }

  removeDiagnosis(index: number) {
    this.diagnoses.splice(index, 1);
  } */

 /*  submit() {
  if (this.form.valid) {
    const idUser = parseInt(localStorage.getItem('IdUser') || '0', 10);
    const idRol = parseInt(localStorage.getItem('IdRol') || '0', 10);

    if (!idUser) {
      alert("No se encontró el usuario en el localStorage.");
      return;
    }

    const formValues = this.form.value;

    const consultation: MedicalConsultationDTO = {
      ...formValues,
      idPatient: this.idPatient,
      idUser,
      createdBy: idUser,
      idMedicalConsultation: this.consultationToEdit?.idMedicalConsultation || 0,

      // Cast numéricos para cumplir con el DTO
      vitalSigns_HR: Number(formValues.vitalSigns_HR),
      vitalSigns_RR: Number(formValues.vitalSigns_RR),
      vitalSigns_Temp: Number(formValues.vitalSigns_Temp),
      vitalSigns_SPO2: Number(formValues.vitalSigns_SPO2),
    };

    const isEdit = consultation.idMedicalConsultation > 0;

    const operation = isEdit
      ? this._medicalConsultationUseCase.UpdateMedicalConsultation(consultation)
      : this._medicalConsultationUseCase.CreateMedicalConsultation(consultation);

    operation.subscribe({
      next: (response) => {
        console.log('📦 Respuesta completa:', response);
        if (response.isSuccess) {
          this.backToList.emit();
        }
      },
      error: (err) => {
        console.error('❌ Error en la petición:', err);
      }
    });
  } else {
    this.form.markAllAsTouched();
  }
} */

  /*  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const idUser = parseInt(localStorage.getItem('IdUser') || '0', 10);
    const idRol = parseInt(localStorage.getItem('IdRol') || '0', 10);

    const formValues = this.form.value;

    const baseData = {
      ...formValues,
      idPatient: this.idPatient,
      idUser,
      createdBy: idUser,
      vitalSigns_HR: Number(formValues.vitalSigns_HR),
      vitalSigns_RR: Number(formValues.vitalSigns_RR),
      vitalSigns_Temp: Number(formValues.vitalSigns_Temp),
      vitalSigns_SPO2: Number(formValues.vitalSigns_SPO2),
    };

    const isEdit = this.consultationToEdit?.idMedicalConsultation > 0;

    let operation;

    if (isEdit) {
      const updatedConsultation: MedicalConsultationDTO = {
        ...baseData,
        idMedicalConsultation: this.consultationToEdit!.idMedicalConsultation
      };
      operation = this._medicalConsultationUseCase.UpdateMedicalConsultation(updatedConsultation);
    } else {
      if (idRol === 1) {
        const newConsultationWithDiagnosis: MedicalConsultationDTO = {
          ...baseData,
          diagnoses: this.diagnoses
        };
        operation = this._medicalConsultationUseCase.CreateMedicalConsultationWithMedicalDiagnosis(newConsultationWithDiagnosis);
      } else {
        const newConsultation: MedicalConsultationDTO = {
          ...baseData,
          idMedicalConsultation: 0
        };
        operation = this._medicalConsultationUseCase.CreateMedicalConsultation(newConsultation);
      }
    }

    operation.subscribe({
      next: (response) => {
        if (response.isSuccess) {
          this.backToList.emit();
        }
      },
      error: (err) => {
        console.error('❌ Error en la petición:', err);
      }
    });
  } */
  
  submit() {
  if (this.form.invalid) {
    this.form.markAllAsTouched();
    return;
  }

  const idUser = parseInt(localStorage.getItem('IdUser') || '0', 10);
  const idRol = parseInt(localStorage.getItem('IdRol') || '0', 10);
  const isEdit = !!this.consultationToEdit;

  const formValues = this.form.getRawValue(); // ✅ Seguro para serializar

  // Asegurar que cada diagnóstico tenga el campo createdBy
  const diagnosesWithCreator = (formValues.diagnoses || []).map((d: any) => ({
    ...d,
    createdBy: idUser
  }));

  const consultation: MedicalConsultationDTO = {
    ...formValues,
    idPatient: this.idPatient,
    idUser,
    createdBy: idUser,
    idMedicalConsultation: this.consultationToEdit?.idMedicalConsultation || 0,
    vitalSigns_HR: Number(formValues.vitalSigns_HR),
    vitalSigns_RR: Number(formValues.vitalSigns_RR),
    vitalSigns_Temp: Number(formValues.vitalSigns_Temp),
    vitalSigns_SPO2: Number(formValues.vitalSigns_SPO2),
    diagnoses: diagnosesWithCreator
  };

  const operation$ = isEdit
    ? this._medicalConsultationUseCase.UpdateMedicalConsultation(consultation)
    : (idRol === 1
        ? this._medicalConsultationUseCase.CreateMedicalConsultationWithMedicalDiagnosis(consultation)
        : this._medicalConsultationUseCase.CreateMedicalConsultation(consultation));

  operation$.subscribe({
    next: (res) => {
      if (res.isSuccess) {
        this.backToList.emit();
      }
    },
    error: (err) => {
      console.error('❌ Error en la petición:', err);
    }
  });
}

  back() {
    this.backToList.emit();
  }
}