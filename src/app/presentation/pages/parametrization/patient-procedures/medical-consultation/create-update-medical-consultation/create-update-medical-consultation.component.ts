import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MedicalConsultationDTO } from 'src/app/core/DTOs/app/medical-consultation.dto';
import { MedicalDiagnosisDTO } from 'src/app/core/DTOs/app/medical-diagnosis.dto';
import { MedicalConsultationDiagnosisUseCase } from 'src/app/infrastructure/use-cases/app/medical-consultation-diagnosis.use-case';
import { MedicalConsultationUseCase } from 'src/app/infrastructure/use-cases/app/medical-consultation.use-case';
import { forkJoin } from 'rxjs';

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
  @Input() consultationToEdit?: MedicalConsultationDTO;
  @Output() backToList = new EventEmitter<void>();

  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private _medicalConsultationUseCase: MedicalConsultationUseCase,
    private _medicalConsultationDiagnosisUseCase: MedicalConsultationDiagnosisUseCase
  ) {
   /*  this.form = this.fb.group({
      consultationReason: ['', Validators.required],
      consultationDate: [new Date()],
      glasgowScore: [''],
      consciousnessStatus: [''],
      hydrationStatus: [''],
      moodStatus: [''],
      respiratoryStatus: [''],
      generalStatus: [''],
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
      isFirstTime: [true],
      weightKg: [''],
      heightCm: [''],
      bmi: [''],
    }); */
    this.form = this.fb.group({
      idMedicalConsultation: [0],      // importante
      updateBy: [0],                   // importante
      consultationReason: ['', Validators.required],
      consultationDate: [new Date()],
      glasgowScore: [0],
      consciousnessStatus: [''],
      hydrationStatus: [''],
      moodStatus: [''],
      respiratoryStatus: [''],
      generalStatus: [''],
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
      isFirstTime: [true],
      weightKg: [0],
      heightCm: [''],
      bmi: [0],
    });
  }


 ngOnInit(): void {
  const idRol = parseInt(localStorage.getItem('IdRol') || '0', 10);

  // Si el rol es admin, asegúrate de que el FormArray exista desde el inicio
  if (idRol === 1 && !this.form.contains('diagnoses')) {
    this.form.addControl('diagnoses', this.fb.array([]));
  }
}

ngOnChanges(changes: SimpleChanges): void {
  if (changes['consultationToEdit'] && this.consultationToEdit) {
    console.log('📦 consultationToEdit llegó en ngOnChanges:', this.consultationToEdit);

    this.form.patchValue(this.consultationToEdit);

    const idRol = parseInt(localStorage.getItem('IdRol') || '0', 10);

    if (idRol === 1) {
      // Asegúrate de que existe el FormArray
      if (!this.form.contains('diagnoses')) {
        this.form.addControl('diagnoses', this.fb.array([]));
      }
      const array = this.form.get('diagnoses') as FormArray;
      array.clear();

      if (this.consultationToEdit.diagnoses?.length) {
        this.consultationToEdit.diagnoses.forEach(d => {
          const group = this.createDiagnosisGroup();
          group.patchValue(d);
          array.push(group);
        });
      } else {
        // Si no hay diagnósticos previos, agrega uno vacío para que el admin pueda crear
        this.addDiagnosis();
      }
    }
  }
}


  get diagnoses(): FormArray {
    return this.form.get('diagnoses') as FormArray;
  }

  private createDiagnosisGroup(): FormGroup {
    return this.fb.group({
      idMedicalConsultationDiagnosis: [0],
      idMedicalConsultation: [0],
      diagnosisCode: ['', Validators.required],
      diagnosisDescription: ['', Validators.required],
      diagnosisType: [''],
      isPrincipal: [false],
      comment: [''],
      updatedBy: [0],
      updatedAt: [''],
      createdBy: [0],
      createdAt: ['']
    });
  }

  addDiagnosis(): void {
    this.diagnoses.push(this.createDiagnosisGroup());
  }

  removeDiagnosis(index: number): void {
    this.diagnoses.removeAt(index);
  }

 /*  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const idUser = parseInt(localStorage.getItem('IdUser') || '0', 10);
    const idRol = parseInt(localStorage.getItem('IdRol') || '0', 10);
    const isEdit = !!this.consultationToEdit?.idMedicalConsultation;

    const formValues = this.form.value;

    const now = new Date().toISOString();

    const baseData: MedicalConsultationDTO = {
      ...formValues,
      idPatient: this.idPatient,
      idUser,
      createdBy: idUser,
      createdAt: now,
      vitalSigns_HR: Number(formValues.vitalSigns_HR),
      vitalSigns_RR: Number(formValues.vitalSigns_RR),
      vitalSigns_Temp: Number(formValues.vitalSigns_Temp),
      vitalSigns_SPO2: Number(formValues.vitalSigns_SPO2),
    };

    if (isEdit) {
      // Edita la consulta
      const updatedConsultation: MedicalConsultationDTO = {
        ...baseData,
        idMedicalConsultation: this.consultationToEdit!.idMedicalConsultation
      };

      this._medicalConsultationUseCase.UpdateMedicalConsultation(updatedConsultation).subscribe({
        next: (response) => {
          if (response.isSuccess) {
            if (idRol === 1 && this.diagnoses.length > 0) {
              this.createDiagnosesForExistingConsultation(this.consultationToEdit!.idMedicalConsultation);
            } else {
              this.backToList.emit();
            }
          }
        },
        error: (err) => {
          console.error('❌ Error al actualizar la consulta:', err);
        }
      });

    } else {
      // Crea la consulta
      let operation;
      if (idRol === 1) {
        const newConsultationWithDiagnosis: MedicalConsultationDTO = {
          ...baseData,
          diagnoses: this.diagnoses.value
        };
        operation = this._medicalConsultationUseCase.CreateMedicalConsultationWithMedicalDiagnosis(newConsultationWithDiagnosis);
      } else {
        const newConsultation: MedicalConsultationDTO = {
          ...baseData,
          idMedicalConsultation: 0
        };
        operation = this._medicalConsultationUseCase.CreateMedicalConsultation(newConsultation);
      }

      operation.subscribe({
        next: (response) => {
          if (response.isSuccess) {
            this.backToList.emit();
          }
        },
        error: (err) => {
          console.error('❌ Error al crear la consulta:', err);
        }
      });
    }
  } */

  submit() {
  if (this.form.invalid) {
    this.form.markAllAsTouched();
    return;
  }

  const idUser = parseInt(localStorage.getItem('IdUser') || '0', 10);
  const idRol = parseInt(localStorage.getItem('IdRol') || '0', 10);
  const isEdit = !!this.consultationToEdit?.idMedicalConsultation;

  const formValues = this.form.value;
  const now = new Date().toISOString();

  // Construimos solo los campos que realmente necesita el backend, excluyendo 'diagnoses'
 /*  const baseData: MedicalConsultationDTO = {
    consultationReason: formValues.consultationReason,
    consultationDate: formValues.consultationDate,
    glasgowScore: formValues.glasgowScore,
    consciousnessStatus: formValues.consciousnessStatus,
    hydrationStatus: formValues.hydrationStatus,
    moodStatus: formValues.moodStatus,
    respiratoryStatus: formValues.respiratoryStatus,
    generalStatus: formValues.generalStatus,
    vitalSigns_BP: formValues.vitalSigns_BP,
    vitalSigns_HR: Number(formValues.vitalSigns_HR),
    vitalSigns_RR: Number(formValues.vitalSigns_RR),
    vitalSigns_Temp: Number(formValues.vitalSigns_Temp),
    vitalSigns_SPO2: Number(formValues.vitalSigns_SPO2),
    physicalExam_HeadNeck: formValues.physicalExam_HeadNeck,
    physicalExam_Chest: formValues.physicalExam_Chest,
    physicalExam_Heart: formValues.physicalExam_Heart,
    physicalExam_Abdomen: formValues.physicalExam_Abdomen,
    physicalExam_GU: formValues.physicalExam_GU,
    physicalExam_Musculoskeletal: formValues.physicalExam_Musculoskeletal,
    physicalExam_Neuro: formValues.physicalExam_Neuro,
    physicalExam_Skin: formValues.physicalExam_Skin,
    observations: formValues.observations,
    status: formValues.status,
    isFirstTime: formValues.isFirstTime,
    weightKg: formValues.weightKg,
    heightCm: formValues.heightCm,
    bmi: formValues.bmi,
    idPatient: this.idPatient,
    idUser,
    createdBy: idUser,
    createdAt: now
  }; */
    const baseData: MedicalConsultationDTO = {
      idMedicalConsultation: isEdit ? this.consultationToEdit!.idMedicalConsultation : 0,
      updateBy: idUser,  // o 0 si quieres, pero normalmente debe ser el id del usuario que hace la acción

      idPatient: this.idPatient,
      idUser,
      createdBy: idUser,
      createdAt: now,

      consultationReason: formValues.consultationReason,
      consultationDate: formValues.consultationDate,
      glasgowScore: Number(formValues.glasgowScore),
      consciousnessStatus: formValues.consciousnessStatus,
      hydrationStatus: formValues.hydrationStatus,
      moodStatus: formValues.moodStatus,
      respiratoryStatus: formValues.respiratoryStatus,
      generalStatus: formValues.generalStatus,
      vitalSigns_BP: formValues.vitalSigns_BP,
      vitalSigns_HR: Number(formValues.vitalSigns_HR),
      vitalSigns_RR: Number(formValues.vitalSigns_RR),
      vitalSigns_Temp: Number(formValues.vitalSigns_Temp),
      vitalSigns_SPO2: Number(formValues.vitalSigns_SPO2),
      physicalExam_HeadNeck: formValues.physicalExam_HeadNeck,
      physicalExam_Chest: formValues.physicalExam_Chest,
      physicalExam_Heart: formValues.physicalExam_Heart,
      physicalExam_Abdomen: formValues.physicalExam_Abdomen,
      physicalExam_GU: formValues.physicalExam_GU,
      physicalExam_Musculoskeletal: formValues.physicalExam_Musculoskeletal,
      physicalExam_Neuro: formValues.physicalExam_Neuro,
      physicalExam_Skin: formValues.physicalExam_Skin,
      observations: formValues.observations,
      status: formValues.status,
      isFirstTime: formValues.isFirstTime,
      weightKg: Number(formValues.weightKg),
      heightCm: formValues.heightCm,
      bmi: Number(formValues.bmi),
      // diagnoses solo si aplica (caso create con admin)
    };

  if (isEdit) {
    // Caso editar: agregamos el ID de la consulta a actualizar
    const updatedConsultation: MedicalConsultationDTO = {
      ...baseData,
      idMedicalConsultation: this.consultationToEdit!.idMedicalConsultation
    };

    console.log('👉 Data que voy a mandar a Update:', updatedConsultation);

    this._medicalConsultationUseCase.UpdateMedicalConsultation(updatedConsultation).subscribe({
      next: (response) => {
        if (response.isSuccess) {
          // Si es admin y hay diagnósticos en el form, creamos los diagnósticos
          if (idRol === 1 && this.diagnoses.length > 0) {
            this.createDiagnosesForExistingConsultation(this.consultationToEdit!.idMedicalConsultation);
          } else {
            this.backToList.emit();
          }
        }
      },
      error: (err) => {
        console.error('❌ Error al actualizar la consulta:', err);
      }
    });

  } else {
    // Caso crear
    let operation;

    /* if (idRol === 1) {
      // Admin: crea consulta junto con diagnósticos
      const newConsultationWithDiagnosis: MedicalConsultationDTO = {
        ...baseData,
        diagnoses: this.diagnoses.value
      };
      operation = this._medicalConsultationUseCase.CreateMedicalConsultationWithMedicalDiagnosis(newConsultationWithDiagnosis);
    }  */

    if (idRol === 1) {
      // Admin: crea consulta junto con diagnósticos
      const preparedDiagnoses = this.diagnoses.value.map((d: any) => ({
        ...d,
        idMedicalConsultationDiagnosis: 0, // indica que es nuevo
        //idMedicalConsultation: null,          // el backend lo asigna
        createdBy: d.createdBy || idUser,
        createdAt: d.createdAt || now,
        updatedBy: idUser,
        updatedAt: now
      }));

      const newConsultationWithDiagnosis: MedicalConsultationDTO = {
        ...baseData,
        diagnoses: preparedDiagnoses
      };

      operation = this._medicalConsultationUseCase.CreateMedicalConsultationWithMedicalDiagnosis(newConsultationWithDiagnosis);
    }

    
    
    else {
      // Otros roles: crea consulta sin diagnósticos
      const newConsultation: MedicalConsultationDTO = {
        ...baseData,
        idMedicalConsultation: 0
      };
      operation = this._medicalConsultationUseCase.CreateMedicalConsultation(newConsultation);
    }

    console.log('👉 Data que voy a mandar a Create:', operation);

    operation.subscribe({
      next: (response) => {
        if (response.isSuccess) {
          this.backToList.emit();
        }
      },
      error: (err) => {
        console.error('❌ Error al crear la consulta:', err);
      }
    });
  }
}

  
  private createDiagnosesForExistingConsultation(idMedicalConsultation: number) {
    const idUser = parseInt(localStorage.getItem('IdUser') || '0', 10);
    const now = new Date().toISOString();

    const createObservables = this.diagnoses.controls.map(control => {
      const diag: MedicalDiagnosisDTO = {
        ...control.value,
        idMedicalConsultation,
        createdBy: control.value.createdBy || idUser,
        createdAt: control.value.createdAt || now,
        updatedBy: idUser,
        updatedAt: now
      };
      return this._medicalConsultationDiagnosisUseCase.CreateMedicalConsultationDiagnosis(diag);
    });

    forkJoin(createObservables).subscribe({
      next: (responses) => {
        const allSuccess = responses.every(res => res.isSuccess);
        if (allSuccess) {
          this.backToList.emit();
        } else {
          console.warn('⚠️ Algunos diagnósticos no se pudieron crear');
        }
      },
      error: (err) => {
        console.error('❌ Error al crear diagnósticos:', err);
      }
    });
  }

  back() {
    this.backToList.emit();
  }
}
