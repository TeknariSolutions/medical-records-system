import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MedicalConsultationDTO } from 'src/app/core/DTOs/app/medical-consultation.dto';
import { MedicalDiagnosisDTO } from 'src/app/core/DTOs/app/medical-diagnosis.dto';
import { MedicalConsultationDiagnosisUseCase } from 'src/app/infrastructure/use-cases/app/medical-consultation-diagnosis.use-case';
import { MedicalConsultationUseCase } from 'src/app/infrastructure/use-cases/app/medical-consultation.use-case';
import { forkJoin } from 'rxjs';
import { Cie10Service } from 'src/app/infrastructure/services/common/CIE10/cie10.service';
import { IcdAuthService } from 'src/app/infrastructure/services/common/ICD-Auth/icd-auth.service';
import { CdkStepper, CdkStepperModule } from '@angular/cdk/stepper';
import { NgStepperModule } from 'angular-ng-stepper';

@Component({
  selector: 'app-create-update-medical-consultation',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule,
    FormsModule,
    CdkStepperModule,
    NgStepperModule 
  ],
  templateUrl: './create-update-medical-consultation.component.html',
  styleUrl: './create-update-medical-consultation.component.css'
})
export class CreateUpdateMedicalConsultationComponent {

  @Input() idPatient!: number;
  @Input() consultationToEdit?: MedicalConsultationDTO;
  @Output() backToList = new EventEmitter<void>();

  form: FormGroup;

  idRol: number = 0; // agrega esta propiedad


  @ViewChild('cdkStepper') stepper!: CdkStepper;

  constructor(
    private fb: FormBuilder,
    private _medicalConsultationUseCase: MedicalConsultationUseCase,
    private _medicalConsultationDiagnosisUseCase: MedicalConsultationDiagnosisUseCase,
    private cie10Service: Cie10Service,
    private _icdAuthService: IcdAuthService
  ) {

   /*  this.form = this.fb.group({
      idMedicalConsultation: [0],      
      updateBy: [0],                
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
      status: [false],
      isFirstTime: [true],
      weightKg: [0],
      heightCm: [''],
      bmi: [0],
    }); */
    
   
    this.form = this.fb.group({
      basicInfo: this.fb.group({
        consultationReason: [''],
        consultationDate: [new Date()],
        isFirstTime: [true],
        status: [false]
      }),
      clinicalStates: this.fb.group({
        moodStatus: [''],
        hydrationStatus: [''],
        glasgowScore: [0],
        consciousnessStatus: [''],
        respiratoryStatus: [''],
        generalStatus: [''],
      }),
      vitalSigns: this.fb.group({
        vitalSigns_BP: [''],
        vitalSigns_HR: [null],
        vitalSigns_RR: [null],
        vitalSigns_Temp: [null],
        vitalSigns_SPO2: [null],
      }),
      physicalExam: this.fb.group({
        weightKg: [0],
        heightCm: [''],
        bmi: [0],
        physicalExam_HeadNeck: [''],
        physicalExam_Chest: [''],
        physicalExam_Heart: [''],
        physicalExam_Abdomen: [''],
        physicalExam_GU: [''],
        physicalExam_Musculoskeletal: [''],
        physicalExam_Neuro: [''],
        physicalExam_Skin: [''],
        observations: [''],
      }),
     
      diagnoses: this.fb.array([]) // solo admin
    });

    // Escuchar cambios para recalcular BMI
    this.form.get('physicalExam.weightKg')?.valueChanges.subscribe(() => this.updateBMI());
    this.form.get('physicalExam.heightCm')?.valueChanges.subscribe(() => this.updateBMI());
  
  }


  ngOnInit(): void {
    const idRol = parseInt(localStorage.getItem('IdRol') || '0', 10);

    this.idRol = parseInt(localStorage.getItem('IdRol') || '0', 10);

    // Si el rol es admin, asegúrate de que el FormArray exista desde el inicio
    if (idRol === 1 && !this.form.contains('diagnoses')) {
      this.form.addControl('diagnoses', this.fb.array([]));
    }

    const weightControl = this.form.get('weightKg');
    const heightControl = this.form.get('heightCm');

    if (weightControl && heightControl) {
      weightControl.valueChanges.subscribe(() => this.updateBMI());
      heightControl.valueChanges.subscribe(() => this.updateBMI());
    }

    // Si es auxiliar (rolId 2): forzar status a false y deshabilitar
    if (idRol === 2) {
      /* this.form.get('status')?.setValue(false);
      this.form.get('status')?.disable(); */

      this.form.get('basicInfo.status')?.setValue(false);
      this.form.get('basicInfo.status')?.disable();
    }

  /*   this.cie10Service.searchCodes('asma').subscribe(data => {
      console.log('Resultados:', data);
    }); */
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


  ngOnChanges(changes: SimpleChanges): void {
  if (changes['consultationToEdit'] && this.consultationToEdit) {
    console.log('📦 consultationToEdit llegó en ngOnChanges:', this.consultationToEdit);

    const normalized = this.normalizeConsultationData(this.consultationToEdit);
    console.log('✅ Normalized data:', normalized);
    this.form.patchValue(normalized);


    const idRol = parseInt(localStorage.getItem('IdRol') || '0', 10);
    if (idRol === 1) {
      // Asegurarse de tener el FormArray
      if (!this.form.contains('diagnoses')) {
        this.form.addControl('diagnoses', this.fb.array([]));
      }
      const array = this.form.get('diagnoses') as FormArray;
      array.clear();

      if (this.consultationToEdit.idMedicalConsultation) {
        // 🔍 Obtener diagnósticos desde el backend

        
        this._medicalConsultationDiagnosisUseCase
          .GetListMedicalConsultationDiagnosisByIdMedicalConsultation(this.consultationToEdit.idMedicalConsultation)
          .subscribe((diagnoses: MedicalDiagnosisDTO[]) => {
            console.log('✅ Diagnósticos cargados:', diagnoses);
            if (diagnoses && diagnoses.length) {
              diagnoses.forEach(d => {
                const group = this.createDiagnosisGroup();
                group.patchValue(d);
                array.push(group);
              });
            } else {
              this.addDiagnosis();
            }
          });
      } else {
        // Si por alguna razón no tiene ID válido, agregamos uno vacío
        this.addDiagnosis();
      }
    }
  }
}
/* 
  get diagnoses(): FormArray {
    return this.form.get('diagnoses') as FormArray;
  } */

  get diagnoses(): FormArray {
    return this.form.get('diagnoses') as FormArray;
  }

  goToNextStep() {
    this.stepper.next();
  }

  /* private normalizeConsultationData(c: any): any {
    return {
      idMedicalConsultation: c.idMedicalConsultation ?? 0,
      updateBy: parseInt(localStorage.getItem('IdUser') || '0', 10),

      consultationReason: c.consultationReason ?? '',
      consultationDate: c.consultationDate ? new Date(c.consultationDate) : new Date(),

      glasgowScore: c.glasgowScore != null ? Number(c.glasgowScore) : 0,
      consciousnessStatus: c.consciousnessStatus ?? '',
      hydrationStatus: c.hydrationStatus ?? '',
      moodStatus: c.moodStatus ?? '',
      respiratoryStatus: c.respiratoryStatus ?? '',
      generalStatus: c.generalStatus ?? '',

      vitalSigns_BP: c.vitalSigns_BP ?? '',
      vitalSigns_HR: c.vitalSigns_HR != null ? Number(c.vitalSigns_HR) : 0,
      vitalSigns_RR: c.vitalSigns_RR != null ? Number(c.vitalSigns_RR) : 0,
      vitalSigns_Temp: c.vitalSigns_Temp != null ? Number(c.vitalSigns_Temp) : 0,
      vitalSigns_SPO2: c.vitalSigns_SPO2 != null ? Number(c.vitalSigns_SPO2) : 0,

      physicalExam_HeadNeck: c.physicalExam_HeadNeck ?? '',
      physicalExam_Chest: c.physicalExam_Chest ?? '',
      physicalExam_Heart: c.physicalExam_Heart ?? '',
      physicalExam_Abdomen: c.physicalExam_Abdomen ?? '',
      physicalExam_GU: c.physicalExam_GU ?? '',
      physicalExam_Musculoskeletal: c.physicalExam_Musculoskeletal ?? '',
      physicalExam_Neuro: c.physicalExam_Neuro ?? '',
      physicalExam_Skin: c.physicalExam_Skin ?? '',

      observations: c.observations ?? '',
      status: c.status ?? false,
      isFirstTime: c.isFirstTime ?? true,
      weightKg: c.weightKg != null ? Number(c.weightKg) : 0,
      heightCm: c.heightCm ?? '',
      bmi: c.bmi != null ? Number(c.bmi) : 0
    };
  } */

  private normalizeConsultationData(c: any): any {
    return {
      basicInfo: {
        consultationReason: c.consultationReason ?? '',
        consultationDate: c.consultationDate ? new Date(c.consultationDate) : new Date(),
        isFirstTime: c.isFirstTime ?? true,
        status: c.status ?? false
      },
      clinicalStates: {
        moodStatus: c.moodStatus ?? '',
        hydrationStatus: c.hydrationStatus ?? '',
        glasgowScore: c.glasgowScore != null ? Number(c.glasgowScore) : 0,
        consciousnessStatus: c.consciousnessStatus ?? '',
        respiratoryStatus: c.respiratoryStatus ?? '',
        generalStatus: c.generalStatus ?? '',
      },
      vitalSigns: {
        vitalSigns_BP: c.vitalSigns_BP ?? '',
        vitalSigns_HR: c.vitalSigns_HR != null ? Number(c.vitalSigns_HR) : 0,
        vitalSigns_RR: c.vitalSigns_RR != null ? Number(c.vitalSigns_RR) : 0,
        vitalSigns_Temp: c.vitalSigns_Temp != null ? Number(c.vitalSigns_Temp) : 0,
        vitalSigns_SPO2: c.vitalSigns_SPO2 != null ? Number(c.vitalSigns_SPO2) : 0,
      },
      physicalExam: {
        weightKg: c.weightKg != null ? Number(c.weightKg) : 0,
        heightCm: c.heightCm ?? '',
        bmi: c.bmi != null ? Number(c.bmi) : 0,
        physicalExam_HeadNeck: c.physicalExam_HeadNeck ?? '',
        physicalExam_Chest: c.physicalExam_Chest ?? '',
        physicalExam_Heart: c.physicalExam_Heart ?? '',
        physicalExam_Abdomen: c.physicalExam_Abdomen ?? '',
        physicalExam_GU: c.physicalExam_GU ?? '',
        physicalExam_Musculoskeletal: c.physicalExam_Musculoskeletal ?? '',
        physicalExam_Neuro: c.physicalExam_Neuro ?? '',
        physicalExam_Skin: c.physicalExam_Skin ?? '',
        observations: c.observations ?? ''
      }
    };
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

/*   updateBMI(): void {
    const weight = this.form.get('weightKg')?.value;
    const heightCm = this.form.get('heightCm')?.value;

    const weightNumber = Number(weight);
    const heightNumber = Number(heightCm);

    if (weightNumber > 0 && heightNumber > 0) {
      const heightInMeters = heightNumber / 100;
      const bmi = weightNumber / (heightInMeters * heightInMeters);

      this.form.get('bmi')?.setValue(parseFloat(bmi.toFixed(2)), { emitEvent: false });
    } else {
      this.form.get('bmi')?.setValue(0, { emitEvent: false });
    }
  } */

  updateBMI() {
    const weight = this.form.get('physicalExam.weightKg')?.value;
    const height = this.form.get('physicalExam.heightCm')?.value;
    const weightNumber = Number(weight);
    const heightNumber = Number(height);

    if (weightNumber > 0 && heightNumber > 0) {
      const heightInMeters = heightNumber / 100;
      const bmi = weightNumber / (heightInMeters * heightInMeters);
      this.form.get('physicalExam.bmi')?.setValue(parseFloat(bmi.toFixed(2)), { emitEvent: false });
    } else {
      this.form.get('physicalExam.bmi')?.setValue(0, { emitEvent: false });
    }
  }


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

  // ✅ Convertir todos los campos numéricos que pueden venir null a números (o 0)
 /*  const baseData: MedicalConsultationDTO = {
    idMedicalConsultation: isEdit ? this.consultationToEdit!.idMedicalConsultation : 0,
    idPatient: this.idPatient,
    idUser,
    createdBy: idUser,
    createdAt: now,
    updateBy: idUser,

    consultationReason: formValues.consultationReason,
    consultationDate: formValues.consultationDate,
    glasgowScore: Number(formValues.glasgowScore) || 0,
    consciousnessStatus: formValues.consciousnessStatus,
    hydrationStatus: formValues.hydrationStatus,
    moodStatus: formValues.moodStatus,
    respiratoryStatus: formValues.respiratoryStatus,
    generalStatus: formValues.generalStatus,
    vitalSigns_BP: formValues.vitalSigns_BP,
    vitalSigns_HR: Number(formValues.vitalSigns_HR) || 0,
    vitalSigns_RR: Number(formValues.vitalSigns_RR) || 0,
    vitalSigns_Temp: Number(formValues.vitalSigns_Temp) || 0,
    vitalSigns_SPO2: Number(formValues.vitalSigns_SPO2) || 0,
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
    weightKg: Number(formValues.weightKg) || 0,
    heightCm: formValues.heightCm,
    bmi: Number(formValues.bmi) || 0
  }; */

  //const formValues = this.form.value;

   const baseData: MedicalConsultationDTO = {
     idMedicalConsultation: isEdit ? this.consultationToEdit!.idMedicalConsultation : 0,
     idPatient: this.idPatient,
     idUser,
     createdBy: idUser,
     createdAt: now,
     updateBy: idUser,

     // basicInfo
     consultationReason: formValues.basicInfo.consultationReason,
     consultationDate: formValues.basicInfo.consultationDate,
     isFirstTime: formValues.basicInfo.isFirstTime,
     status: formValues.basicInfo.status,

     // clinicalStates
     moodStatus: formValues.clinicalStates.moodStatus,
     hydrationStatus: formValues.clinicalStates.hydrationStatus,
     glasgowScore: Number(formValues.clinicalStates.glasgowScore) || 0,
     consciousnessStatus: formValues.clinicalStates.consciousnessStatus,
     respiratoryStatus: formValues.clinicalStates.respiratoryStatus,
     generalStatus: formValues.clinicalStates.generalStatus,

     // vitalSigns
     vitalSigns_BP: formValues.vitalSigns.vitalSigns_BP,
     vitalSigns_HR: Number(formValues.vitalSigns.vitalSigns_HR) || 0,
     vitalSigns_RR: Number(formValues.vitalSigns.vitalSigns_RR) || 0,
     vitalSigns_Temp: Number(formValues.vitalSigns.vitalSigns_Temp) || 0,
     vitalSigns_SPO2: Number(formValues.vitalSigns.vitalSigns_SPO2) || 0,

     // physicalExam
     weightKg: Number(formValues.physicalExam.weightKg) || 0,
     heightCm: formValues.physicalExam.heightCm,
     bmi: Number(formValues.physicalExam.bmi) || 0,
     physicalExam_HeadNeck: formValues.physicalExam.physicalExam_HeadNeck,
     physicalExam_Chest: formValues.physicalExam.physicalExam_Chest,
     physicalExam_Heart: formValues.physicalExam.physicalExam_Heart,
     physicalExam_Abdomen: formValues.physicalExam.physicalExam_Abdomen,
     physicalExam_GU: formValues.physicalExam.physicalExam_GU,
     physicalExam_Musculoskeletal: formValues.physicalExam.physicalExam_Musculoskeletal,
     physicalExam_Neuro: formValues.physicalExam.physicalExam_Neuro,
     physicalExam_Skin: formValues.physicalExam.physicalExam_Skin,
     observations: formValues.physicalExam.observations
   };


  if (isEdit) {
    // Caso editar: igual que antes
    console.log('👉 Data que voy a mandar a Update:', baseData);

    this._medicalConsultationUseCase.UpdateMedicalConsultation(baseData).subscribe({
      next: (response) => {
        if (response.isSuccess) {
          if (idRol === 1 && this.diagnoses.length > 0) {
            this.saveDiagnosesForExistingConsultation();
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
    let operation;

    if (idRol === 1) {
      // ✅ Caso crear con admin: preparar diagnósticos
      const preparedDiagnoses = this.diagnoses.value.map((d: any) => ({
        ...d,
        idMedicalConsultationDiagnosis: 0,
        createdBy: d.createdBy || idUser,
        createdAt: d.createdAt || now,
        updatedBy: idUser,
        updatedAt: now
      }));

      // ✅ Armar payload envolviendo en createMedicalConsultationWithMedicalDiagnosisDTO
      /* const payload = {
        createMedicalConsultationWithMedicalDiagnosisDTO: {
          ...baseData,
          diagnoses: preparedDiagnoses
        }
      }; */

      const newConsultationWithDiagnosis: MedicalConsultationDTO = {
        ...baseData,
        diagnoses: preparedDiagnoses
      };

      console.log('👉 Data que voy a mandar a Create:', newConsultationWithDiagnosis);

      operation = this._medicalConsultationUseCase.CreateMedicalConsultationWithMedicalDiagnosis(newConsultationWithDiagnosis);

    } else {
      // Otros roles: crear sin diagnósticos
      const newConsultation: MedicalConsultationDTO = {
        ...baseData,
        idMedicalConsultation: 0
      };
      console.log('👉 Data que voy a mandar a Create:', newConsultation);

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
}



private saveDiagnosesForExistingConsultation() {
  const idUser = parseInt(localStorage.getItem('IdUser') || '0', 10);
  const now = new Date().toISOString();

  const operations = this.diagnoses.controls.map(control => {
    const diag: MedicalDiagnosisDTO = {
      ...control.value,
      idMedicalConsultation: this.consultationToEdit!.idMedicalConsultation,
      updatedBy: idUser,
      updatedAt: now,
    };

    if (diag.idMedicalConsultationDiagnosis > 0) {
      // ya existe → actualizar
      return this._medicalConsultationDiagnosisUseCase.UpdateMedicalConsultationDiagnosis(diag);
    } else {
      // nuevo → crear
      diag.createdBy = idUser;
      diag.createdAt = now;
      return this._medicalConsultationDiagnosisUseCase.CreateMedicalConsultationDiagnosis(diag);
    }
  });

  forkJoin(operations).subscribe({
    next: (responses) => {
      const allSuccess = responses.every(res => res.isSuccess);
      if (allSuccess) {
        this.backToList.emit();
      } else {
        console.warn('⚠️ Algunos diagnósticos no se pudieron guardar');
        this.backToList.emit(); // opcional: aún así volvemos
      }
    },
    error: (err) => {
      console.error('❌ Error al guardar diagnósticos:', err);
    }
  });
}


  back() {
    this.backToList.emit();
  }
}
