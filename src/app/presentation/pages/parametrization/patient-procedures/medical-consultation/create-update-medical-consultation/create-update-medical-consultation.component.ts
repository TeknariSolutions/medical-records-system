import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, Input, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MedicalConsultationDTO } from 'src/app/core/DTOs/app/medical-consultation.dto';
import { MedicalDiagnosisDTO } from 'src/app/core/DTOs/app/medical-diagnosis.dto';
import { MedicalConsultationDiagnosisUseCase } from 'src/app/infrastructure/use-cases/app/medical-consultation-diagnosis.use-case';
import { MedicalConsultationUseCase } from 'src/app/infrastructure/use-cases/app/medical-consultation.use-case';
import { debounceTime, forkJoin, Observable, of, Subject, switchMap } from 'rxjs';
import { Cie10Service } from 'src/app/infrastructure/services/common/CIE10/cie10.service';
import { CdkStepper, CdkStepperModule } from '@angular/cdk/stepper';
import { NgStepperModule } from 'angular-ng-stepper';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { MedicalHistoryUseCase } from 'src/app/infrastructure/use-cases/app/medical-history.use-case';
import { MedicalHistoryDTO } from 'src/app/core/DTOs/app/medical-history.dto';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { CreateUpdateMedicalHistoryComponent } from '../../medical-histories/create-update-medical-history/create-update-medical-history.component';
import { Cie10UseCase } from 'src/app/infrastructure/use-cases/common/cie10.use-case';
import { PaginatorDTO } from 'src/app/core/DTOs/common/paginator/paginator.dto';
import { TableResultDTO } from 'src/app/core/DTOs/common/table-result/table-result.dto';
import { NotificationsService } from 'src/app/infrastructure/services/common/notifications/notifications.service';
import { CloseConsultationUseCase } from 'src/app/infrastructure/use-cases/app/close-consultation.use-case';

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

  // Lista quemada para diagnosisType
  //diagnosisTypes = ['Confirmado nuevo', 'Confirmado repetido'];
  diagnosisTypes = [
  { codeDiagnosisType: '01', diagnosisType: 'Impresión' },
  { codeDiagnosisType: '02', diagnosisType: 'Confirmado nuevo' },
  { codeDiagnosisType: '03', diagnosisType: 'Confirmado repetido' }
];

  // Para guardar resultados de la búsqueda
  cie10Results$: Observable<any[]>[] = [];
  cie10Suggestions: any[][] = [];
  searchTerms = new Subject<string>();

  lastMedicalHistory?: MedicalHistoryDTO;

  modalRef?: BsModalRef;

  idUser: number = Number(localStorage.getItem('IdUser'));

  currentPage: number = 1;
  pageSize: number = 10; 
  pageSizeOptions = [5, 10, 25, 100]; 
  totalRecords: number = 0;



  code = '';
  description = '';
  suggestions: any[] = [];

  
  showDropdown = false;

  codeSuggestions: any[] = [];
  descriptionSuggestions: any[] = [];

  showDescriptionDropdown: boolean[] = [];
  showCodeDropdown: boolean[] = [];

  paginator: PaginatorDTO = { pageIndex: 1, pageSize: 1000 };

  consultationFinalities: any[] = [];
  exitConditions: any[] = [];
  externalCauses: any[] = [];

  submitted = false;



  @ViewChild('cdkStepper') stepper!: CdkStepper;

  constructor(
    private fb: FormBuilder,
    private modalService: BsModalService,
    private _medicalConsultationUseCase: MedicalConsultationUseCase,
    private _medicalConsultationDiagnosisUseCase: MedicalConsultationDiagnosisUseCase,
    private _medicalHistoryUseCase: MedicalHistoryUseCase,
    private cie10UseCase: Cie10UseCase,
    //private cie10Service: Cie10Service,
    private sanitizer: DomSanitizer,
    private cdr: ChangeDetectorRef,
    private _notificationService: NotificationsService,
    private _closeConsultationUseCase: CloseConsultationUseCase
  ) {

    this.form = this.fb.group({
      basicInfo: this.fb.group({
        consultationReason: ['', Validators.required],
        //consultationDate: [new Date().toISOString()],
        consultationDate: this.getLocalDateTime(),
        //consultationDate: [new Date()],
        isFirstTime: [true],
        status: [false],
        currentIllness: ['']
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
        weightKg: [0],
        heightCm: [''],
        bmi: [0],
      }),
      physicalExam: this.fb.group({
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
      paraClinicals: this.fb.group({
        paraClinicalTest: ['']
      }),
      closeConsultation: this.fb.group({
        idConsultationFinality: [0],
        idExitCondition: [0],
        idExternalCauseCode: [0],
      }),
     
      diagnoses: this.fb.array([]) // solo admin
    });

    // Escuchar cambios para recalcular BMI
    this.form.get('vitalSigns.weightKg')?.valueChanges.subscribe(() => this.updateBMI());
    this.form.get('vitalSigns.heightCm')?.valueChanges.subscribe(() => this.updateBMI());
  
  }


 /*  ngOnInit(): void {
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
      this.form.get('basicInfo.status')?.setValue(false);
      this.form.get('basicInfo.status')?.disable();
    }

    this.loadLastMedicalHistory();


    this.form.get('basicInfo.status')?.valueChanges.subscribe(async (value) => {
      if (value) {
        const confirmed = await this._notificationService.confirm(
          'Advertencia',
          'Si marca la consulta como CERRADA y la guarda ya no podrá editarla después.',
          'warning'
        );

        if (!confirmed) {
          this.form.get('basicInfo.status')?.setValue(false, { emitEvent: false });
        }
      }
    });

    // 🔒 Si la consulta ya está cerrada, bloqueamos edición
    if (this.consultationToEdit?.status) {
      this.form.disable();
    }

    this.loadExistConditions();
    this.loadExternalCauseCodes();
    this.loadConsultationFinalities();

  } */


  ngOnInit(): void {
    const idRol = parseInt(localStorage.getItem('IdRol') || '0', 10);
    this.idRol = idRol;

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
      this.form.get('basicInfo.status')?.setValue(false);
      this.form.get('basicInfo.status')?.disable();
    }

    this.loadLastMedicalHistory();
    this.patchDiagnoses();

    // 🔒 Si la consulta ya está cerrada, bloqueamos edición
    if (this.consultationToEdit?.status) {
      this.form.disable();
    } else {
      // 👉 Solo suscribirse si la consulta NO está cerrada
      this.form.get('basicInfo.status')?.valueChanges.subscribe(async (value) => {
        if (value) {
          const confirmed = await this._notificationService.confirm(
            'Advertencia',
            'Si marca la consulta como CERRADA y la guarda ya no podrá editarla después.',
            'warning'
          );

          if (!confirmed) {
            this.form.get('basicInfo.status')?.setValue(false, { emitEvent: false });
          }
        }
      });
    }

    this.loadExistConditions();
    this.loadExternalCauseCodes();
    this.loadConsultationFinalities();
  }

  private patchDiagnoses(): void {
    if (this.consultationToEdit?.diagnoses?.length) {
      const diagnosesArray = this.form.get('diagnoses') as FormArray;
      this.consultationToEdit.diagnoses.forEach(d => {
        diagnosesArray.push(this.fb.group({
          idMedicalConsultationDiagnosis: [d.idMedicalConsultationDiagnosis],
          diagnosisCode: [d.diagnosisCode],
          diagnosisDescription: [d.diagnosisDescription],
          diagnosisType: [d.diagnosisType],
          codeDiagnosisType: [d.codeDiagnosisType],
          isPrincipal: [d.isPrincipal],
          comment: [d.comment],
        }));
      });
    }
  }



// helper getter para el FormArray
get diagnoses(): FormArray {
  return this.form.get('diagnoses') as FormArray;
}


onCodeInput(value: string, index: number) {
  this.diagnoses.at(index).patchValue({ diagnosisDescription: '' });

  if (value && value.length >= 2) {
    this.searchCIE10({ code: value }, index);
  } else {
    this.codeSuggestions[index] = [];
    this.descriptionSuggestions[index] = [];
    this.showCodeDropdown[index] = false;
    this.showDescriptionDropdown[index] = false;
  }
}

onDescriptionInput(value: string, index: number) {
  this.diagnoses.at(index).patchValue({ diagnosisCode: '' });

  if (value && value.length >= 3) {
    this.searchCIE10({ name: value }, index);
  } else {
    this.codeSuggestions[index] = [];
    this.descriptionSuggestions[index] = [];
    this.showCodeDropdown[index] = false;
    this.showDescriptionDropdown[index] = false;
  }
}

searchCIE10(
  filters: { code?: string; name?: string },
  index: number
) {
  this.cie10UseCase
    .GetListCIECodes(this.paginator, filters.name || '', filters.code || '')
    .subscribe({
      next: (data: TableResultDTO) => {
        const results = data?.results || [];

        // llenar ambas listas
        this.codeSuggestions[index] = results;
        this.descriptionSuggestions[index] = results;

        // mostrar ambos dropdowns
        this.showCodeDropdown[index] = this.codeSuggestions[index].length > 0;
        this.showDescriptionDropdown[index] = this.descriptionSuggestions[index].length > 0;

        this.cdr.detectChanges();
      },
      error: () => {
        this.codeSuggestions[index] = [];
        this.descriptionSuggestions[index] = [];
        this.showCodeDropdown[index] = false;
        this.showDescriptionDropdown[index] = false;
      },
    });
}


selectSuggestion(item: any, index: number) {
  const diagnosisGroup = this.diagnoses.at(index) as FormGroup;

  // Rellenar ambos campos
  diagnosisGroup.get('diagnosisCode')?.setValue(item.codigo);
  diagnosisGroup.get('diagnosisDescription')?.setValue(item.nombre);

  // Limpiar sugerencias
  this.codeSuggestions[index] = [];
  this.descriptionSuggestions[index] = [];
}


// Método para sanear:
sanitize(html: string): SafeHtml {
  return this.sanitizer.bypassSecurityTrustHtml(html);
}

removeHtmlTags(html: string): string {
  return html.replace(/<[^>]+>/g, '');
}


/*   ngOnChanges(changes: SimpleChanges): void {
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
                group.patchValue({
                  ...d,
                  diagnosisDescription: this.removeHtmlTags(d.diagnosisDescription || '')
                });
                array.push(group);
              });

            } else {
              //this.addDiagnosis();
            }
          });
      } else {
        // Si por alguna razón no tiene ID válido, agregamos uno vacío
        this.addDiagnosis();
      }
    }
  }
}
 */


  ngOnChanges(changes: SimpleChanges): void {
    if (changes['consultationToEdit'] && this.consultationToEdit) {
      console.log('📦 consultationToEdit llegó en ngOnChanges:', this.consultationToEdit);

      const normalized = this.normalizeConsultationData(this.consultationToEdit);
      console.log('✅ Normalized data:', normalized);
      this.form.patchValue(normalized);

      const idRol = parseInt(localStorage.getItem('IdRol') || '0', 10);
      if (idRol === 1) {
        if (!this.form.contains('diagnoses')) {
          this.form.addControl('diagnoses', this.fb.array([]));
        }
        const array = this.form.get('diagnoses') as FormArray;
        array.clear();

        if (this.consultationToEdit.idMedicalConsultation) {
          this._medicalConsultationDiagnosisUseCase
            .GetListMedicalConsultationDiagnosisByIdMedicalConsultation(this.consultationToEdit.idMedicalConsultation)
            .subscribe((diagnoses: MedicalDiagnosisDTO[]) => {
              console.log('✅ Diagnósticos cargados:', diagnoses);
              if (diagnoses && diagnoses.length) {
                diagnoses.forEach(d => {
                  const group = this.createDiagnosisGroup();
                  group.patchValue({
                    diagnosisCode: d.diagnosisCode,
                    diagnosisDescription: this.removeHtmlTags(d.diagnosisDescription || ''),
                    codeDiagnosisType: d.codeDiagnosisType || '', // 👈 siempre asignamos aunque venga vacío
                    diagnosisType: d.diagnosisType || ''
                  });
                  array.push(group);
                });
              } else {
                this.addDiagnosis();
              }
            });
        } else {
          this.addDiagnosis();
        }
      }
    }
  }


  goToNextStep() {
    this.stepper.next();
  }

  private normalizeConsultationData(c: any): any {
    return {
      basicInfo: {
        consultationReason: c.consultationReason ?? '',
        consultationDate: c.consultationDate ? new Date(c.consultationDate) : new Date(),
        isFirstTime: c.isFirstTime ?? true,
        status: c.status ?? false,
        currentIllness: c.currentIllness ?? ''
      },
      clinicalStates: {
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
        weightKg: c.weightKg != null ? Number(c.weightKg) : 0,
        heightCm: c.heightCm ?? '',
        bmi: c.bmi != null ? Number(c.bmi) : 0,
      },
      physicalExam: {
        physicalExam_HeadNeck: c.physicalExam_HeadNeck ?? '',
        physicalExam_Chest: c.physicalExam_Chest ?? '',
        physicalExam_Heart: c.physicalExam_Heart ?? '',
        physicalExam_Abdomen: c.physicalExam_Abdomen ?? '',
        physicalExam_GU: c.physicalExam_GU ?? '',
        physicalExam_Musculoskeletal: c.physicalExam_Musculoskeletal ?? '',
        physicalExam_Neuro: c.physicalExam_Neuro ?? '',
        physicalExam_Skin: c.physicalExam_Skin ?? '',
        observations: c.observations ?? ''
      },
      paraClinicals: {
        paraClinicalTest: c.paraClinicalTest ?? ''
      },
      closeConsultation: {
        idConsultationFinality: c.idConsultationFinality != null ? Number(c.idConsultationFinality) : 0,
        idExitCondition: c.idExitCondition != null ? Number(c.idExitCondition) : 0,
        idExternalCauseCode: c.idExternalCauseCode != null ? Number(c.idExternalCauseCode) : 0,
      },
    };
  }

  private createDiagnosisGroup(): FormGroup {
    return this.fb.group({
      idMedicalConsultationDiagnosis: [0],
      idMedicalConsultation: [0],
      diagnosisCode: ['', Validators.required],
      diagnosisDescription: ['', Validators.required],
      codeDiagnosisType: [''], 
      diagnosisType: [''],
      isPrincipal: [false],
      comment: [''],
      updatedBy: [0],
      updatedAt: [''],
      createdBy: [0],
      createdAt: [''],
      updateAt: ['']
    });
  }


  addDiagnosis() {

    const now = new Date().toISOString();
    const userId = Number(localStorage.getItem('IdUser')) || 0;

    const diagForm = this.fb.group({
      diagnosisCode: [''],
      diagnosisDescription: [''],
      codeDiagnosisType: [''],
      diagnosisType: [''],
      comment: [''],
      isPrincipal: [false],
      createdBy: [userId],
      createdAt: [now],
      updatedBy: [userId],
      updatedAt: [now]
    });
    this.diagnoses.push(diagForm);
  }

  removeDiagnosis(index: number) {
    this.diagnoses.removeAt(index);
    this.cie10Results$.splice(index, 1); 
  }

  onDiagnosisTypeChange(index: number) {
    const group = this.diagnoses.at(index) as FormGroup;
    if (!group) return;

    const selected = group.get('diagnosisType')?.value; // aquí vendrá el objeto {codeDiagnosisType, diagnosisType} por [ngValue]
    if (selected && typeof selected === 'object') {
      const code = selected.codeDiagnosisType ?? selected.code ?? '';
      const text = selected.diagnosisType ?? selected.name ?? '';
      group.patchValue({
        codeDiagnosisType: String(code).trim(),
        diagnosisType: text
      }, { emitEvent: false });
    } else {
      // Si por alguna razón diagnosisType viene como string (ej.: al precargar), intentar mantener code si existe
      const existingCode = group.get('codeDiagnosisType')?.value;
      group.patchValue({
        codeDiagnosisType: existingCode ?? '',
        diagnosisType: selected ?? ''
      }, { emitEvent: false });
    }
  }


  updateBMI() {
    const weight = this.form.get('vitalSigns.weightKg')?.value;
    const height = this.form.get('vitalSigns.heightCm')?.value;
    const weightNumber = Number(weight);
    const heightNumber = Number(height);

    if (weightNumber > 0 && heightNumber > 0) {
      const heightInMeters = heightNumber / 100;
      const bmi = weightNumber / (heightInMeters * heightInMeters);
      this.form.get('vitalSigns.bmi')?.setValue(parseFloat(bmi.toFixed(2)), { emitEvent: false });
    } else {
      this.form.get('vitalSigns.bmi')?.setValue(0, { emitEvent: false });
    }
  }

  getLocalDateTime(): string {
    const now = new Date();

    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0'); // enero = 0
    const day = now.getDate().toString().padStart(2, '0');
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  }


  submit(): void {

    this.submitted = true;

    if (this.form.invalid) {
      this._notificationService.showInfoMessage('Completa todos los campos requeridos antes de guardar');
      return;
    }

    const idUser = Number(localStorage.getItem('IdUser'));
    const idRol = Number(localStorage.getItem('IdRol'));

    const formValues = this.form.value;
    const isEdit = !!this.consultationToEdit;

    // 🟢 Datos base
    const baseData: MedicalConsultationDTO = {
      idMedicalConsultation: isEdit ? this.consultationToEdit!.idMedicalConsultation : 0,
      idPatient: this.idPatient,
      idUser: idUser,

      consultationReason: formValues.basicInfo.consultationReason,
      consultationDate: isEdit
        ? this.consultationToEdit!.consultationDate // ✅ mantener original en edición
        : this.getLocalDateTime(), // ✅ nueva consulta usa localDateTime
      isFirstTime: formValues.basicInfo.isFirstTime,
      status: formValues.basicInfo.status,
      currentIllness: formValues.basicInfo.currentIllness,

      hydrationStatus: formValues.clinicalStates.hydrationStatus,
      glasgowScore: Number(formValues.clinicalStates.glasgowScore),
      consciousnessStatus: formValues.clinicalStates.consciousnessStatus,
      respiratoryStatus: formValues.clinicalStates.respiratoryStatus,
      generalStatus: formValues.clinicalStates.generalStatus,

      vitalSigns_BP: formValues.vitalSigns.vitalSigns_BP,
      vitalSigns_HR: Number(formValues.vitalSigns.vitalSigns_HR),
      vitalSigns_RR: Number(formValues.vitalSigns.vitalSigns_RR),
      vitalSigns_Temp: Number(formValues.vitalSigns.vitalSigns_Temp),
      vitalSigns_SPO2: Number(formValues.vitalSigns.vitalSigns_SPO2),
      weightKg: Number(formValues.vitalSigns.weightKg),
      heightCm: formValues.vitalSigns.heightCm,
      bmi: Number(formValues.vitalSigns.bmi),

      physicalExam_HeadNeck: formValues.physicalExam.physicalExam_HeadNeck,
      physicalExam_Chest: formValues.physicalExam.physicalExam_Chest,
      physicalExam_Heart: formValues.physicalExam.physicalExam_Heart,
      physicalExam_Abdomen: formValues.physicalExam.physicalExam_Abdomen,
      physicalExam_GU: formValues.physicalExam.physicalExam_GU,
      physicalExam_Musculoskeletal: formValues.physicalExam.physicalExam_Musculoskeletal,
      physicalExam_Neuro: formValues.physicalExam.physicalExam_Neuro,
      physicalExam_Skin: formValues.physicalExam.physicalExam_Skin,
      observations: formValues.physicalExam.observations,

      paraClinicalTest: formValues.paraClinicals.paraClinicalTest,

      idConsultationFinality: Number(formValues.closeConsultation.idConsultationFinality),
      idExitCondition: Number(formValues.closeConsultation.idExitCondition),
      idExternalCauseCode: Number(formValues.closeConsultation.idExternalCauseCode),

      createdBy: isEdit ? Number(this.consultationToEdit!.createdBy) : idUser,
      createdAt: isEdit ? this.consultationToEdit!.createdAt : this.getLocalDateTime(), // ✅ no tocar en edición
      updateBy: idUser,
      updateAt: this.getLocalDateTime()
    };

    let operation: Observable<any>;

    if (isEdit) {
      // 🟢 Editar
      operation = this._medicalConsultationUseCase.UpdateMedicalConsultation(baseData);

      operation.subscribe({
        next: (res) => {
          if (res.isSuccess) {
            // 👉 Guardar diagnósticos después de actualizar la consulta
            this.saveDiagnosesForExistingConsultation();
            this._notificationService.showInfoMessage('Consulta actualizada correctamente');
          } else {
            this._notificationService.showInfoMessage('Error al actualizar la consulta');
          }
        },
        error: (err) => {
          this._notificationService.showInfoMessage('Error al actualizar la consulta');
          console.error(err);
        }
      });

      return; // 👈 importante: salimos aquí para no ejecutar el bloque común de abajo
    }

    // 🟢 Crear
    if (idRol === 1 && this.diagnoses.length > 0) {
      // ✅ Admin con diagnósticos → usar CreateMedicalConsultationWithMedicalDiagnosis
      /* const preparedDiagnoses = this.diagnoses.value.map((d: any) => ({
        ...d,
        idMedicalConsultationDiagnosis: 0,
        createdBy: idUser,
        createdAt: this.getLocalDateTime(),
        updatedBy: idUser,
        updatedAt: this.getLocalDateTime(),
        codeDiagnosisType: d.codeDiagnosisType || '', // 👈 nunca null
        diagnosisType: d.diagnosisType || ''
      }));
 */

      const preparedDiagnoses = this.diagnoses.value.map((d: any) => {
        // Si diagnosisType es un objeto, lo desarmamos
        if (d.diagnosisType && typeof d.diagnosisType === 'object') {
          return {
            ...d,
            codeDiagnosisType: d.diagnosisType.codeDiagnosisType,
            diagnosisType: d.diagnosisType.diagnosisType,
          };
        }

        // Si diagnosisType es solo un código, buscamos el objeto correspondiente
        const selectedType = this.diagnosisTypes.find(t => t.codeDiagnosisType === d.diagnosisType);
        return {
          ...d,
          codeDiagnosisType: selectedType?.codeDiagnosisType || '',
          diagnosisType: selectedType?.diagnosisType || '',
        };
      });

      const newConsultationWithDiagnosis: MedicalConsultationDTO = {
        ...baseData,
        diagnoses: preparedDiagnoses
      };

      operation = this._medicalConsultationUseCase.CreateMedicalConsultationWithMedicalDiagnosis(newConsultationWithDiagnosis);

    } else {
      // ✅ Admin sin diagnósticos o Auxiliar → usar CreateMedicalConsultation
      operation = this._medicalConsultationUseCase.CreateMedicalConsultation(baseData);
    }

    // 🟢 Ejecutar operación (solo creación)
    operation.subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this._notificationService.showInfoMessage('Consulta creada correctamente');
          this.backToList.emit();
        } else {
          this._notificationService.showInfoMessage('Error al crear la consulta');
        }
      },
      error: (err) => {
        this._notificationService.showInfoMessage('Error al guardar la consulta');
        console.error(err);
      }
    });
  }

  private saveDiagnosesForExistingConsultation() {
  const idUser = parseInt(localStorage.getItem('IdUser') || '0', 10);
  const now = new Date().toISOString();

  const operations = this.diagnoses.controls.map(control => {
    const diag: MedicalDiagnosisDTO = {
      ...control.value,
      idMedicalConsultation: this.consultationToEdit!.idMedicalConsultation,
      updatedBy: idUser,
      updatedAt: this.getLocalDateTime(),
    };

    if (diag.idMedicalConsultationDiagnosis > 0) {
      // ya existe → actualizar
      return this._medicalConsultationDiagnosisUseCase.UpdateMedicalConsultationDiagnosis(diag);
    } else {
      // nuevo → crear
      diag.createdBy = idUser;
      diag.createdAt = this.getLocalDateTime();
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

  // Medical History

  loadLastMedicalHistory(): void {
    this._medicalHistoryUseCase.GetLastMedicalHistory(this.idPatient)
      .subscribe((data) => {
        this.lastMedicalHistory = data; // asignas el objeto directamente

        console.log(this.lastMedicalHistory)
      });
  }


 openCreateMedicalHistoryModal(): void {
  const initialState = {
    lastMedicalHistory: this.lastMedicalHistory,  // pasa solo el primero
    idPatient: this.idPatient,
    idUser: this.idUser,
    isEditMode: false
  };
  this.modalRef = this.modalService.show(CreateUpdateMedicalHistoryComponent, {
    initialState,
    class: 'modal-lg'
  });

  this.modalRef.onHidden?.subscribe(() => {
    this.loadLastMedicalHistory();
  });
}

  loadExistConditions(): void {
    this._closeConsultationUseCase.GetExitConditions()
      .subscribe((data) => {
        this.exitConditions = data; // asignas el objeto directamente

        console.log(this.exitConditions)
      });
  }

  loadExternalCauseCodes(): void {
    this._closeConsultationUseCase.GetExternalCauseCodes()
      .subscribe((data) => {
        this.externalCauses = data; // asignas el objeto directamente

        console.log(this.externalCauses)
      });
  }

  loadConsultationFinalities(): void {
    this._closeConsultationUseCase.GetConsultationFinalities()
      .subscribe((data) => {
        this.consultationFinalities = data; // asignas el objeto directamente

        console.log(this.consultationFinalities)
      });
  }


}
