import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, EventEmitter, inject, Input, Output, SimpleChanges, ViewChild } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MedicalConsultationDTO } from 'src/app/core/DTOs/app/medical-consultation.dto';
import { MedicalDiagnosisDTO } from 'src/app/core/DTOs/app/medical-diagnosis.dto';
import { MedicalConsultationDiagnosisUseCase } from 'src/app/infrastructure/use-cases/app/medical-consultation-diagnosis.use-case';
import { MedicalConsultationUseCase } from 'src/app/infrastructure/use-cases/app/medical-consultation.use-case';
import { debounceTime, forkJoin, map, Observable, of, Subject, switchMap } from 'rxjs';
import { Cie10Service } from 'src/app/infrastructure/services/common/CIE10/cie10.service';
import { CdkStepper, CdkStepperModule, StepperOrientation } from '@angular/cdk/stepper';
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
import { DateTimeHelper } from 'src/app/infrastructure/helpers/date-time.helper';


import { MatStepperModule } from '@angular/material/stepper';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { UsersUseCase } from 'src/app/infrastructure/use-cases/app/users.use-case';
import { CupsCodeUseCase } from 'src/app/infrastructure/use-cases/common/cups-code.use.case';
import { MedicalServicesUseCase } from 'src/app/infrastructure/use-cases/app/medical-services.use-case';
import { ModalityAttentionUseCase } from 'src/app/infrastructure/use-cases/common/modality-attention.use-case';



@Component({
  selector: 'app-create-update-medical-consultation',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    CdkStepperModule,
    NgStepperModule,

    MatStepperModule,
    MatButtonModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
  ],
  templateUrl: './create-update-medical-consultation.component.html',
  styleUrl: './create-update-medical-consultation.component.css'
})
export class CreateUpdateMedicalConsultationComponent {

  isLinear = false;
  currentStep = 1;


  @ViewChild('stepperWrapper', { static: false }) stepperWrapper!: ElementRef<HTMLDivElement>;

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


   groupServices = [
    { code: '01', description: 'Consulta externa' },
    { code: '02', description: 'Apoyo diagnostico y complementación terapéutica' },
    { code: '03', description: 'Internación' },
    { code: '04', description: 'Quirúrgico' },
    { code: '05', description: 'Atención inmediata' }
  ];

  // Para guardar resultados de la búsqueda
  cie10Results$: Observable<any[]>[] = [];
  cie10Suggestions: any[][] = [];
  searchTerms = new Subject<string>();

  // CUPS
  cupsCodes: any[][] = [];

  //  Servicios medicos
  medicalServices: any[][] = [];

  // Modalidades de Atencion
  modalitiesAttention: any[][] = [];

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

  doctors: any[] = [];

  submitted = false;

  @ViewChild('cdkStepper') stepper!: CdkStepper;

  constructor(
    private fb: FormBuilder,
    private modalService: BsModalService,
    private _medicalConsultationUseCase: MedicalConsultationUseCase,
    private _medicalConsultationDiagnosisUseCase: MedicalConsultationDiagnosisUseCase,
    private _medicalHistoryUseCase: MedicalHistoryUseCase,
    private cie10UseCase: Cie10UseCase,
    private sanitizer: DomSanitizer,
    private cdr: ChangeDetectorRef,
    private _notificationService: NotificationsService,
    private _closeConsultationUseCase: CloseConsultationUseCase,
    private _usersUseCase: UsersUseCase,
    private _cupsCodeUseCase: CupsCodeUseCase,
    private _medicalServicesUseCase: MedicalServicesUseCase,
    private _modalityAttentionUseCase: ModalityAttentionUseCase
  ) {
    // ✅ Obtener el rol inmediatamente (antes de ngOnChanges)
    this.idRol = Number(localStorage.getItem('IdRol')) || 0;

    // ✅ Inicializar el formulario
    this.form = this.fb.group({
      basicInfo: this.fb.group({
        consultationReason: ['', Validators.required],
        consultationDate: this.getLocalDateTime(),
        isFirstTime: [true],
        status: [false],
        currentIllness: [''],
        idUser: [null, Validators.required],
        idCupsCode: [null],
        idMedicalServices: [null],
        idModalityAttention: [null],
        groupServiceCode: ['']
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
        heightCm: ['', [this.heightCmValidator()]],
        bmi: [0],
      }),
      physicalExam: this.fb.group({
        physicalExam_HeadNeck: ['NO APLICA'],
        physicalExam_Chest: ['NO APLICA'],
        physicalExam_Heart: ['NO APLICA'],
        physicalExam_Abdomen: ['NO APLICA'],
        physicalExam_GU: ['NO APLICA'],
        physicalExam_Musculoskeletal: ['NO APLICA'],
        physicalExam_Neuro: ['NO APLICA'],
        physicalExam_Skin: ['NO APLICA'],
        observations: ['NO APLICA'],
      }),
      paraClinicals: this.fb.group({
        paraClinicalTest: ['']
      }),
      closeConsultation: this.fb.group({
        idConsultationFinality: [null],
        idExitCondition: [null],
        idExternalCauseCode: [null],
      }),
      analysisOrConcept: this.fb.group({
        analysisOrConcept: [null],
        treatment: [null]
      }),
      diagnoses: this.fb.array([]) // solo admin y médico
    });

    // Escuchar cambios para recalcular BMI
    this.form.get('vitalSigns.weightKg')?.valueChanges.subscribe(() => this.updateBMI());
    this.form.get('vitalSigns.heightCm')?.valueChanges.subscribe(() => this.updateBMI());
  }

  ngOnInit(): void {
    const idRol = this.idRol;

    // Habilitar diagnósticos solo para admin (1) y médico (3)
    if ((idRol === 1 || idRol === 3) && !this.form.contains('diagnoses')) {
      this.form.addControl('diagnoses', this.fb.array([]));
    }

    // Forzar switch "status" a false y deshabilitar solo si es auxiliar (2)
    if (idRol === 2) {
      this.form.get('basicInfo.status')?.setValue(false);
      this.form.get('basicInfo.status')?.disable();
    }

    // 🔒 Si la consulta está cerrada y el rol es 2 o 3 → deshabilitar todo
    if (this.consultationToEdit?.status && (idRol === 2 || idRol === 3)) {
      this.form.disable({ emitEvent: false });
    } else {
      // Advertencia solo para roles 2 y 3
      this.form.get('basicInfo.status')?.valueChanges.subscribe(async (value) => {
        if (value && (idRol === 2 || idRol === 3)) {
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

    // 🔄 Cargar listas
    this.loadLastMedicalHistory();
    this.patchDiagnoses();
    this.loadExistConditions();
    this.loadExternalCauseCodes();
    this.loadConsultationFinalities();
    this.loadDoctors();
    this.loadCupsCodes();
    this.loadMedicalServices();
    this.loadModalityAttention();
  }


  ngOnChanges(changes: SimpleChanges): void {
    if (changes['consultationToEdit'] && this.consultationToEdit) {
      const normalized = this.normalizeConsultationData(this.consultationToEdit);
      this.form.patchValue(normalized);

      // ✅ Aplicar bloqueo dinámico solo si rol = 2 o 3 y está cerrada
      if (this.consultationToEdit.status && (this.idRol === 2 || this.idRol === 3)) {
        this.form.disable({ emitEvent: false });
      } else {
        this.form.enable({ emitEvent: false });
      }

      // Diagnósticos solo para admin y médico
      if (this.idRol === 1 || this.idRol === 3) {
        if (!this.form.contains('diagnoses')) {
          this.form.addControl('diagnoses', this.fb.array([]));
        }

        const array = this.form.get('diagnoses') as FormArray;
        array.clear();

        if (this.consultationToEdit.idMedicalConsultation) {
          this._medicalConsultationDiagnosisUseCase
            .GetListMedicalConsultationDiagnosisByIdMedicalConsultation(
              this.consultationToEdit.idMedicalConsultation
            )
            .subscribe((diagnoses: MedicalDiagnosisDTO[]) => {
              if (diagnoses?.length) {
                diagnoses.forEach(d => {
                  const group = this.createDiagnosisGroup();

                  const matchedType = this.diagnosisTypes.find(t =>
                    String(t.codeDiagnosisType) === String(d.codeDiagnosisType) ||
                    t.diagnosisType === d.diagnosisType
                  );

                  group.patchValue({
                    idMedicalConsultationDiagnosis: d.idMedicalConsultationDiagnosis ?? 0,
                    idMedicalConsultation: d.idMedicalConsultation ?? this.consultationToEdit?.idMedicalConsultation ?? 0,
                    diagnosisCode: d.diagnosisCode ?? '',
                    diagnosisDescription: this.removeHtmlTags(d.diagnosisDescription ?? ''),
                    codeDiagnosisType: d.codeDiagnosisType ?? '',
                    comment: d.comment || '',
                    isPrincipal: d.isPrincipal || false,
                    diagnosisType: matchedType ?? (d.diagnosisType || '')
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

    if (value && value.length >= 4) {
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
        currentIllness: c.currentIllness ?? '',
        idUser: c.idUser || null,
        idCupsCode: c.idCupsCode || null,
        idMedicalServices: c.idMedicalServices || null,
        idModalityAttention: c.idModalityAttention != null ? Number(c.idModalityAttention) : null,
        groupServiceCode: c.groupServiceCode || '',
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
      analysisOrConcept: {
        analysisOrConcept: c.analysisOrConcept ?? '',
        treatment: c.treatment ?? '',
      },
      closeConsultation: {
        idConsultationFinality: c.idConsultationFinality || null,
        idExitCondition: c.idExitCondition || null,
        idExternalCauseCode: c.idExternalCauseCode || null,
      },
    };
  }

  private createDiagnosisGroup(): FormGroup {
    return this.fb.group({
      idMedicalConsultationDiagnosis: [0],
      idMedicalConsultation: [0],
      diagnosisCode: [''],
      diagnosisDescription: [''],
      codeDiagnosisType: [''],
      diagnosisType: [''],
      isPrincipal: [false],
      comment: [''],
      updatedBy: [0],
      updatedAt: [''],
      createdBy: [0],
      createdAt: [''],
    });
  }

  addDiagnosis() {
    const now = this.getLocalDateTime();
    const userId = Number(localStorage.getItem('IdUser')) || 0;

    const group = this.createDiagnosisGroup();
    group.patchValue({
      idMedicalConsultationDiagnosis: 0,
      idMedicalConsultation: this.consultationToEdit?.idMedicalConsultation ?? 0,
      createdBy: userId,
      createdAt: now,
      updatedBy: userId,
      updatedAt: now,
      diagnosisType: null
    });

    this.diagnoses.push(group);
  }


  removeDiagnosis(index: number) {
    this.diagnoses.removeAt(index);
    this.cie10Results$.splice(index, 1);
  }

  onDiagnosisTypeChange(index: number) {
    const group = this.diagnoses.at(index) as FormGroup;
    if (!group) return;

    const selected = group.get('diagnosisType')?.value;

    if (selected && typeof selected === 'object') {
      // Actualizamos ambos valores: el objeto completo y el código
      group.patchValue({
        diagnosisType: selected, // mantenemos el objeto completo para que se vea en el select
        codeDiagnosisType: String(selected.codeDiagnosisType ?? selected.code ?? '').trim()
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

  heightCmValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;

      if (value === null || value === undefined || value === '') return null;

      // Verificar que sea número entero
      if (!Number.isInteger(Number(value))) {
        return { notInteger: true };
      }

      // Verificar rango válido
      if (value < 30 || value > 300) {
        return { outOfRange: true };
      }

      return null;
    };
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

    const userLogged = Number(localStorage.getItem('IdUser'));
    const idRol = Number(localStorage.getItem('IdRol'));

    const formValues = this.form.value;
    const isEdit = !!this.consultationToEdit;

    // Datos base
    const baseData: MedicalConsultationDTO = {
      idMedicalConsultation: isEdit ? this.consultationToEdit!.idMedicalConsultation : 0,
      idPatient: this.idPatient,
      idUser: formValues.basicInfo.idUser,
      idCupsCode: formValues.basicInfo.idCupsCode,
      idMedicalServices: formValues.basicInfo.idMedicalServices,
      idModalityAttention: formValues.basicInfo.idModalityAttention,
      groupServiceCode: formValues.basicInfo.groupServiceCode,

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
      heightCm: String(formValues.vitalSigns.heightCm),
      bmi: Number(formValues.vitalSigns.bmi),

      /* physicalExam_HeadNeck: formValues.physicalExam.physicalExam_HeadNeck,
      physicalExam_Chest: formValues.physicalExam.physicalExam_Chest,
      physicalExam_Heart: formValues.physicalExam.physicalExam_Heart,
      physicalExam_Abdomen: formValues.physicalExam.physicalExam_Abdomen,
      physicalExam_GU: formValues.physicalExam.physicalExam_GU,
      physicalExam_Musculoskeletal: formValues.physicalExam.physicalExam_Musculoskeletal,
      physicalExam_Neuro: formValues.physicalExam.physicalExam_Neuro,
      physicalExam_Skin: formValues.physicalExam.physicalExam_Skin,
      observations: formValues.physicalExam.observations, */

      physicalExam_HeadNeck: formValues.physicalExam.physicalExam_HeadNeck && formValues.physicalExam.physicalExam_HeadNeck.trim() !== ''
        ? formValues.physicalExam.physicalExam_HeadNeck.trim()
        : 'NO APLICA',

      physicalExam_Chest: formValues.physicalExam.physicalExam_Chest && formValues.physicalExam.physicalExam_Chest.trim() !== ''
        ? formValues.physicalExam.physicalExam_Chest.trim()
        : 'NO APLICA',

      physicalExam_Heart: formValues.physicalExam.physicalExam_Heart && formValues.physicalExam.physicalExam_Heart.trim() !== ''
        ? formValues.physicalExam.physicalExam_Heart.trim()
        : 'NO APLICA',

      physicalExam_Abdomen: formValues.physicalExam.physicalExam_Abdomen && formValues.physicalExam.physicalExam_Abdomen.trim() !== ''
        ? formValues.physicalExam.physicalExam_Abdomen.trim()
        : 'NO APLICA',

      physicalExam_GU: formValues.physicalExam.physicalExam_GU && formValues.physicalExam.physicalExam_GU.trim() !== ''
        ? formValues.physicalExam.physicalExam_GU.trim()
        : 'NO APLICA',

      physicalExam_Musculoskeletal: formValues.physicalExam.physicalExam_Musculoskeletal && formValues.physicalExam.physicalExam_Musculoskeletal.trim() !== ''
        ? formValues.physicalExam.physicalExam_Musculoskeletal.trim()
        : 'NO APLICA',

      physicalExam_Neuro: formValues.physicalExam.physicalExam_Neuro && formValues.physicalExam.physicalExam_Neuro.trim() !== ''
        ? formValues.physicalExam.physicalExam_Neuro.trim()
        : 'NO APLICA',

      physicalExam_Skin: formValues.physicalExam.physicalExam_Skin && formValues.physicalExam.physicalExam_Skin.trim() !== ''
        ? formValues.physicalExam.physicalExam_Skin.trim()
        : 'NO APLICA',

      observations: formValues.physicalExam.observations && formValues.physicalExam.observations.trim() !== ''
        ? formValues.physicalExam.observations.trim()
        : 'NO APLICA',


      paraClinicalTest: formValues.paraClinicals.paraClinicalTest,

      analysisOrConcept: formValues.analysisOrConcept.analysisOrConcept,
      treatment: formValues.analysisOrConcept.treatment,

      idConsultationFinality: formValues.closeConsultation.idConsultationFinality ?? null,
      idExitCondition: formValues.closeConsultation.idExitCondition ?? null,
      idExternalCauseCode: formValues.closeConsultation.idExternalCauseCode ?? null,

      

      createdBy: isEdit ? Number(this.consultationToEdit!.createdBy) : userLogged,
      createdAt: isEdit ? this.consultationToEdit!.createdAt : this.getLocalDateTime(), // no tocar en edición
      updateBy: userLogged,
      updateAt: this.getLocalDateTime()
    };

    let operation: Observable<any>;

    if (isEdit) {
      // Editar
      operation = this._medicalConsultationUseCase.UpdateMedicalConsultation(baseData);

      operation.subscribe({
        next: (res) => {
          if (res.isSuccess) {
            // Actualizamos el form y el objeto en memoria con lo que devuelve el backend
            if (res.data) {
              this.form.patchValue(res.data);
              this.consultationToEdit = res.data;
            } else {
              // fallback: al menos sincronizamos con lo que acabamos de enviar
              this.form.patchValue(baseData);
              this.consultationToEdit = baseData;
            }

            // Guardar diagnósticos después de actualizar la consulta
            this.saveDiagnosesForExistingConsultation();

            this._notificationService.showInfoMessage('Consulta actualizada correctamente');

            // Si quieres volver a la lista, hazlo aquí (después de refrescar datos)
            this.backToList.emit();
          } else {
            this._notificationService.showInfoMessage('Error al actualizar la consulta');
          }
        },
        error: (err) => {
          this._notificationService.showInfoMessage('Error al actualizar la consulta');
          console.error(err);
        }
      });

      return; 
    }

    // Crear
    if ((idRol === 1 || idRol === 3) && this.diagnoses.length > 0) {
      // Admin con diagnósticos → usar CreateMedicalConsultationWithMedicalDiagnosis
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
      // Admin sin diagnósticos o Auxiliar → usar CreateMedicalConsultation
      operation = this._medicalConsultationUseCase.CreateMedicalConsultation(baseData);
    }

    // Ejecutar operación (solo creación)
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
  const now = this.getLocalDateTime();

  const operations = this.diagnoses.controls
    .map(control => control.value)
    .filter(value =>
      // solo enviar si realmente hay información
      value.diagnosisCode || value.diagnosisDescription || value.diagnosisType
    )
    .map(value => {
      const codeDiagnosisType = value.diagnosisType && typeof value.diagnosisType === 'object'
        ? value.diagnosisType.codeDiagnosisType
        : (value.codeDiagnosisType || '');

      const diagnosisTypeText = value.diagnosisType && typeof value.diagnosisType === 'object'
        ? value.diagnosisType.diagnosisType
        : (value.diagnosisType || '');

      const diag: MedicalDiagnosisDTO = {
        ...value,
        idMedicalConsultation: this.consultationToEdit!.idMedicalConsultation,
        diagnosisCode: value.diagnosisCode || '',
        diagnosisDescription: value.diagnosisDescription || '',
        codeDiagnosisType: codeDiagnosisType,
        diagnosisType: diagnosisTypeText,
        isPrincipal: value.isPrincipal || false,
        comment: value.comment || '',
        updatedBy: idUser,
        createdBy: idUser,
        createdAt: now,
        updatedAt: now,
        idMedicalConsultationDiagnosis: value.idMedicalConsultationDiagnosis ?? 0
      };

      if (diag.idMedicalConsultationDiagnosis && diag.idMedicalConsultationDiagnosis > 0) {
        return this._medicalConsultationDiagnosisUseCase.UpdateMedicalConsultationDiagnosis(diag);
      } else {
        return this._medicalConsultationDiagnosisUseCase.CreateMedicalConsultationDiagnosis(diag);
      }
    });

  if (operations.length === 0) {
    // no hay diagnósticos válidos que guardar, no llamamos nada
    return;
  }

  forkJoin(operations).subscribe({
    next: (responses) => {
      const allSuccess = responses.every(res => res.isSuccess);
      if (allSuccess) {
        this.backToList.emit();
      } else {
        console.warn('⚠️ Algunos diagnósticos no se pudieron guardar');
        this.backToList.emit();
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
      });
  }

  loadExternalCauseCodes(): void {
    this._closeConsultationUseCase.GetExternalCauseCodes()
      .subscribe((data) => {
        this.externalCauses = data; // asignas el objeto directamente
      });
  }

  loadConsultationFinalities(): void {
    this._closeConsultationUseCase.GetConsultationFinalities()
      .subscribe((data) => {
        this.consultationFinalities = data; // asignas el objeto directamente
      });
  }

  loadDoctors(): void {
    const idCompany = localStorage.getItem('IdCompany'); 
    const companyId = idCompany ? Number(idCompany) : 0; 

    this._usersUseCase.GetListDoctors(this.paginator, '', '', companyId)
      .subscribe((data) => {
        this.doctors = data.results;
      });
  }


  loadCupsCodes(): void {
    this._cupsCodeUseCase.GetCupsConsultationneumology()
      .subscribe((data) => {
        this.cupsCodes = data;
      });
  }

  loadMedicalServices(): void {
    this._medicalServicesUseCase.GetMedicalServicesNeumology()
      .subscribe((data) => {
        this.medicalServices = data;
      });
  }

  loadModalityAttention(): void {
    this._modalityAttentionUseCase.GetListModalityAttention()
      .subscribe((data) => {
        this.modalitiesAttention = data;
      });
  }

  

  scrollStepper(offset: number) {
    if (!this.stepperWrapper) return;
    this.stepperWrapper.nativeElement.scrollBy({ left: offset, behavior: 'smooth' });
  }


  goToStep(step: number) {
    this.currentStep = step;

    // intentar encontrar el elemento con data-step igual al número
    try {
      const wrapper = this.stepperWrapper?.nativeElement;
      if (!wrapper) return;

      const el: HTMLElement | null = wrapper.querySelector(`.step[data-step="${step}"]`);
      if (!el) return;

      // offset relativo dentro del wrapper
      const left = el.offsetLeft - wrapper.offsetLeft - 8; // 8px margen pequeño
      wrapper.scrollTo({ left, behavior: 'smooth' });

      // opcional: pequeño highlight (clase temporal)
      el.classList.add('clicked-step');
      setTimeout(() => el.classList.remove('clicked-step'), 400);
    } catch (err) {
      console.warn('goToStep error', err);
    }
  }

  nextStep() {
    // avanza al siguiente visible (máx 8)
    const maxStep = 8;
    if (this.currentStep < maxStep) {
      // si siguiente es admin-only y usuario no es admin, saltar
      let next = this.currentStep + 1;
      if ((next === 6 || next === 7) && this.idRol === 2) {
        next = 8; // saltar antec/dx si no es admin
      }
      this.goToStep(next);
    }
  }

  prevStep() {
    if (this.currentStep > 1) {
      let prev = this.currentStep - 1;
      if ((prev === 6 || prev === 7) && this.idRol === 2) {
        prev = 5; // saltar back si no es admin
      }
      this.goToStep(prev);
    }
  }

  resetStepper() {
    this.goToStep(1);
  }


}
