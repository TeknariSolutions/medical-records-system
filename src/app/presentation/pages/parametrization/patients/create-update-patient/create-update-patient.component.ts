import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { NgStepperModule } from 'angular-ng-stepper';
import { CdkStepper, CdkStepperModule, StepperSelectionEvent } from '@angular/cdk/stepper';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { PatientDTO } from 'src/app/core/DTOs/app/patient.dto';
import { PatientsUseCase } from 'src/app/infrastructure/use-cases/app/patients.use-case';
import { NgSelectModule } from '@ng-select/ng-select';
import { DataTransferService } from 'src/app/infrastructure/services/common/data-transfer/data-transfer.service';
import { take } from 'rxjs';
import { LocationService } from 'src/app/infrastructure/services/common/location/location.service';
//import { Eps, EpsColombiaService } from 'src/app/infrastructure/services/common/EPS/eps-colombia.service';
import { CountriesUseCase } from 'src/app/infrastructure/use-cases/app/countries.use-case';
import { DateTimeHelper } from 'src/app/infrastructure/helpers/date-time.helper';
import { EpsUseCase } from 'src/app/infrastructure/use-cases/common/eps.use-case';
//import { Eps } from 'src/app/infrastructure/services/common/EPS/eps.service';


@Component({
  standalone: true,
  selector: 'app-create-update-patient',
  templateUrl: './create-update-patient.component.html',
  styleUrl: './create-update-patient.component.css',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgStepperModule,
    NgSelectModule,
    CdkStepperModule,
    RouterModule,
  ]
})
export class CreateUpdatePatientComponent implements OnInit {

  patientForm: FormGroup;
  onClose: (result: string) => void = () => {};
  patientData?: PatientDTO;
  isEditMode: boolean = false;
  submitted = false;

  countries: any[] = [];
  departments: any[] = [];
  cities: any[] = [];

  // EPS
  epsList: any[] = [];

  // Tipos de documento
  documentTypes = [
    { value: 'CC', label: 'Cédula de ciudadanía' },
    { value: 'CE', label: 'Cédula de extranjería' },
    { value: 'CD', label: 'Carné diplomático' },
    { value: 'PA', label: 'Pasaporte' },
    { value: 'SC', label: 'Salvoconducto' },
    { value: 'PE', label: 'Permiso especial de permanencia' },
    { value: 'DE', label: 'Documento extranjero' },
    { value: 'TI', label: 'Tarjeta de identidad' },
    { value: 'RC', label: 'Registro civil' },
    { value: 'CN', label: 'Certificado de nacido vivo (hasta 20 caracteres)' },
    { value: 'AS', label: 'Adulto sin identificar' },
    { value: 'MS', label: 'Menor sin identificar' }
  ];

  // Generos
  genres = [
    { value: 'M', label: 'Masculino' },
    { value: 'F', label: 'Femenino' },
    { value: 'I', label: 'Indeterminado' },
  ];

  // Tipos de Sangre
  bloodTypes = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];

  // Parentescos
  relationships = [
    { value: 'PADRE', label: 'Padre' },
    { value: 'MADRE', label: 'Madre' },
    { value: 'HIJO', label: 'Hijo(a)' },
    { value: 'HERMANO', label: 'Hermano(a)' },
    { value: 'ABUELO', label: 'Abuelo(a)' },
    { value: 'TÍO', label: 'Tío(a)' },
    { value: 'SOBRINO', label: 'Sobrino(a)' },
    { value: 'PRIMO', label: 'Primo(a)' },
    { value: 'CÓNYUGE', label: 'Cónyuge' },
    { value: 'PAREJA', label: 'Pareja o compañero(a) permanente' },
    { value: 'YERNO', label: 'Yerno / Nuera' },
    { value: 'SUEGRO', label: 'Suegro(a)' },
    { value: 'NIETO', label: 'Nieto(a)' },
    { value: 'OTRO', label: 'Otro' }
  ];

  // Regimenes
  regimes = [
    { code: 1, description: 'Contributivo' },
    { code: 2, description: 'Subsidiado' },
    { code: 3, description: 'Vinculado' },
    { code: 4, description: 'Particular' },
    { code: 5, description: 'Otros' }
  ];

  // Zonas territoriales
  territorialZoneCodes = [
    { code: '01', description: 'Urbana' },
    { code: '02', description: 'Rural' },
  ];


  constructor(
    private formBuilder: FormBuilder,
    private _patientsUseCase: PatientsUseCase,
    private router: Router,
    private _route: ActivatedRoute,
    public bsModalRef: BsModalRef,
    private _dataTransferService: DataTransferService,
    private locationService: LocationService,
    private _epsUseCase: EpsUseCase,
    private _countriesUseCase: CountriesUseCase
  ) {}


 ngOnInit(): void {
  this.initForm();
  this.loadEPS();
  this.loadCountries();

  const idPatient = this._route.snapshot.paramMap.get('idPatient');

  if (idPatient) {
    this.isEditMode = true;
    this._patientsUseCase.GetPatientByIdAll(Number(idPatient)).subscribe({
      next: (patient) => {
        this.patientData = patient; // ya viene con countryId, departmentId, municipalityId

        const birthDayFormatted = this.formatDate(patient.birthDay);

        this.patientForm.patchValue({
          personalInfo: {
            firstName: patient.firstName,
            secondName: patient.secondName,
            firstLastName: patient.firstLastName,
            secondLastName: patient.secondLastName,
            documentType: patient.documentType,
            idDocument: patient.idDocument,
            birthDay: birthDayFormatted,
            sex: patient.sex,
            maritalStatus: patient.maritalStatus,
          },
          contactInfo: {
            address: patient.address,
            countryId: patient.countryId,    
            departmentId: patient.departmentId,   
            municipalityId: patient.municipalityId,
            territorialZoneCode: patient.territorialZoneCode, 
            phoneNumber: patient.phoneNumber,
            phoneNumber2: patient.phoneNumber2,
            email: patient.email,
            nameOfGuardian: patient.nameOfGuardian,
            idDocumentGuardian: patient.idDocumentGuardian,
            documentTypeGuradian: patient.documentTypeGuradian,
            relationship: patient.relationship,
            addressOfGuardian: patient.addressOfGuardian,
            phoneNumberOfGuardian: patient.phoneNumberOfGuardian,
            emailOfGuardian: patient.emailOfGuardian,
          },
          medicalInfo: {
            isDisAbility: patient.isDisAbility,
            disAbilityDescription: patient.disAbilityDescription,
            bloodType: patient.bloodType?.trim() || null,
            idEps: patient.idEps,
            stratum: patient.stratum,
            codRegimen: patient.codRegimen ? Number(patient.codRegimen.toString().trim()) : null,
            regime: patient.regime,
          },
          aditionalInfo: {
            job: patient.job,
            ethnic: patient.ethnic,
          }
        });
      }
    });
  }
}

  
 /*  ngOnDestroy(): void {
    this._dataTransferService.clearData();
  } */

  private initForm(): void {
    this.patientForm = this.formBuilder.group({
      personalInfo: this.formBuilder.group({
        firstName: ['', Validators.required],
        secondName: [''],
        firstLastName: ['', Validators.required],
        secondLastName: [''],
        documentType: [null, Validators.required],
        idDocument: ['', Validators.required],
        birthDay: ['', Validators.required],
        sex: [null, Validators.required],
        maritalStatus: [null, Validators.required],
      }),

      contactInfo: this.formBuilder.group({
        address: ['', Validators.required],
        countryId: [48],
        departmentId: [null],
        municipalityId: [null],
        territorialZoneCode : [null],
        codRegimen: [null],
        phoneNumber: ['', Validators.required],
        phoneNumber2: [''],
        email: [''],

        nameOfGuardian: [''],
        idDocumentGuardian: [''],
        documentTypeGuradian: [''],
        relationship: [''],
        addressOfGuardian: [''],
        phoneNumberOfGuardian: [''],
        emailOfGuardian: [''],
      }),

      medicalInfo: this.formBuilder.group({
        isDisAbility: [false, Validators.required],
        disAbilityDescription: [''],
        bloodType: [null, Validators.required],
        idEps: [null, Validators.required],
        stratum: ['', Validators.required],
        regime: ['', Validators.required],
        codRegimen: [null, Validators.required],
      }),

      aditionalInfo: this.formBuilder.group({
        job: [''],
        ethnic: ['']
      })
    });
  }

  goToNextStep(stepper: CdkStepper): void {
    const groupNames = ['personalInfo', 'contactInfo', 'medicalInfo'];
    const currentStepIndex = stepper.selectedIndex;

    const currentGroupName = groupNames[currentStepIndex];
    const currentGroup = this.patientForm.get(currentGroupName) as FormGroup;

    if (currentGroup.valid) {
      stepper.next();
      // IMPORTANTE: no marcar submitted aquí
    } else {
      this.submitted = true; // Solo marcar como submitted si hay errores
      currentGroup.markAllAsTouched();
    }
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if ((control as FormGroup).controls) {
        this.markFormGroupTouched(control as FormGroup);
      }
    });
  }

  private formatDate(dateString: string): string {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
  }

  loadEPS(): void {
    this._epsUseCase.GetEps('').subscribe(data => {
      this.epsList = data;
    });
  }

  
  // Cargar países 
  
  loadCountries() {
    this._countriesUseCase
      .GetListCountries({ pageIndex: 1, pageSize: 300 })
      .subscribe({
        next: (res) => {
          this.countries = res.results;

          // Si estamos creando (no editando) y queremos precargar departamentos de Colombia
          if (!this.isEditMode) {
            const defaultCountryId = this.patientForm.get('contactInfo.countryId')?.value;
            if (defaultCountryId) {
              this.onCountryChange(defaultCountryId);
            }
          }

          // Si estamos editando, ya manejas esta lógica aparte
          if (this.isEditMode && this.patientData?.countryId) {
            this.patientForm.get('contactInfo.countryId')?.setValue(this.patientData.countryId);
            this.onCountryChange(this.patientData.countryId);
          }
        },
        error: (err) => {
          console.error('Error cargando países', err);
        }
      });
  }

  
  // Cargar departamentos al seleccionar país
  onCountryChange(IdCountry: number) {
    this.departments = [];
    this.cities = [];
    this.patientForm.get('contactInfo.departmentId')?.setValue('');
    this.patientForm.get('contactInfo.municipalityId')?.setValue('');

    this._countriesUseCase
      .GetListDepartments({ pageIndex: 1, pageSize: 300 }, '', IdCountry)
      .subscribe({
        next: (res) => {
          this.departments = res.results;

          // Si estoy en edición y ya tengo departmentId
          if (this.isEditMode && this.patientData?.departmentId) {
            this.patientForm.get('contactInfo.departmentId')?.setValue(this.patientData.departmentId);

            // Llamo al siguiente paso (cargar ciudades)
            this.onDepartmentChange(this.patientData.departmentId);
          }
        },
        error: (err) => {
          console.error('Error cargando departamentos', err);
        }
      });
  }

  // Cargar ciudades al seleccionar departamento
  onDepartmentChange(IdDepartment: number) {
    this.cities = [];
    this.patientForm.get('contactInfo.municipalityId')?.setValue('');

    this._countriesUseCase
      .GetListMunicipalities({ pageIndex: 1, pageSize: 200 }, '', '', IdDepartment)
      .subscribe({
        next: (res) => {
          this.cities = res.results;

          // Si estoy en edición y ya tengo municipalityId
          if (this.isEditMode && this.patientData?.municipalityId) {
            this.patientForm.get('contactInfo.municipalityId')?.setValue(this.patientData.municipalityId);
          }
        },
        error: (err) => {
          console.error('Error cargando municipios', err);
        }
      });
  }

  onSubmit(): void {
    this.submitted = true;

    const IdUser = localStorage.getItem('IdUser');
    const IdCompany = localStorage.getItem('IdCompany');

    if (this.patientForm.valid) {
      const formValue = this.patientForm.value;

      const patientData: PatientDTO = {
        idPatient: this.isEditMode ? this.patientData!.idPatient : 0,
        firstName: formValue.personalInfo.firstName,
        secondName: formValue.personalInfo.secondName,
        firstLastName: formValue.personalInfo.firstLastName,
        secondLastName: formValue.personalInfo.secondLastName,
        documentType: formValue.personalInfo.documentType,
        idDocument: String(formValue.personalInfo.idDocument),
        birthDay: formValue.personalInfo.birthDay,
        sex: formValue.personalInfo.sex,
        maritalStatus: formValue.personalInfo.maritalStatus,
        address: formValue.contactInfo.address,
        countryId: Number(formValue.contactInfo.countryId),
        departmentId: Number(formValue.contactInfo.departmentId),
        municipalityId: Number(formValue.contactInfo.municipalityId),
        territorialZoneCode: formValue.contactInfo.territorialZoneCode,
        phoneNumber: String(formValue.contactInfo.phoneNumber),
        phoneNumber2: String(formValue.contactInfo.phoneNumber2 || ''),
        email: formValue.contactInfo.email,
        isDisAbility: formValue.medicalInfo.isDisAbility,
        disAbilityDescription: formValue.medicalInfo.disAbilityDescription,
        bloodType: formValue.medicalInfo.bloodType,
        idEps: Number(formValue.medicalInfo.idEps),
        stratum: formValue.medicalInfo.stratum,
        regime: formValue.medicalInfo.regime,
        codRegimen: formValue.medicalInfo.codRegimen,
        job: formValue.aditionalInfo.job,
        ethnic: formValue.aditionalInfo.ethnic,
        idCompany: Number(IdCompany),
        createdBy: Number(IdUser),

        createdAt: DateTimeHelper.getLocalDateTimeWithOffset(),
        updatedBy: Number(IdUser),
        updatedAt: DateTimeHelper.getLocalDateTimeWithOffset(),
        nameOfGuardian: formValue.contactInfo.nameOfGuardian,
        idDocumentGuardian: formValue.contactInfo.idDocumentGuardian,
        documentTypeGuradian: formValue.contactInfo.documentTypeGuradian,
        relationship: formValue.contactInfo.relationship,
        addressOfGuardian: formValue.contactInfo.addressOfGuardian,
        phoneNumberOfGuardian: formValue.contactInfo.phoneNumberOfGuardian,
        emailOfGuardian: formValue.contactInfo.emailOfGuardian,
      };

      const payload = patientData;

      const operation = this.isEditMode
        ? this._patientsUseCase.UpdatePatient(payload)
        : this._patientsUseCase.CreatePatient(payload);

      operation.subscribe({
        next: () => {
          this.router.navigate(['/parametrization/patients']);
          this.onClose('refresh');
          this.bsModalRef.hide();
        },
        error: (err) => {
          console.error('Error al guardar paciente:', err);
        }
      });
    }
  }

  onCancel(): void {
    this.bsModalRef.hide();
  }

  // Actualizar Regimen

  /* onRegimeChange(event: Event) {
    const selectedCode = +(event.target as HTMLSelectElement).value;
    const selected = this.regimes.find(r => r.code === selectedCode);

    if (selected) {
      this.patientForm.get('medicalInfo')?.patchValue({
        codRegimen: selected.code,
        regime: selected.description
      });
    } else {
      this.patientForm.get('medicalInfo')?.patchValue({
        codRegimen: null,
        regime: ''
      });
    }
  } */

  onRegimeChange(event: Event) {
    const selectedCode = +(event.target as HTMLSelectElement).value;
    const selected = this.regimes.find(r => r.code === selectedCode);

    if (selected) {
      this.patientForm.get('medicalInfo')?.patchValue({
        codRegimen: selected.code,
        regime: selected.description
      });

      // 🆕 Filtrar EPS por el régimen seleccionado
      this._epsUseCase.GetEps(selected.description).subscribe({
        next: (data) => {
          this.epsList = data;
          // Limpio el valor de la EPS seleccionada si el régimen cambió
          this.patientForm.get('medicalInfo.idEps')?.setValue(null);
        },
        error: (err) => {
          console.error('Error al cargar EPS por régimen', err);
          this.epsList = [];
        }
      });
    } else {
      this.patientForm.get('medicalInfo')?.patchValue({
        codRegimen: null,
        regime: ''
      });
      this.epsList = [];
    }
  }


  goBackToPatients(): void {
  this.router.navigate(['/parametrization/patients']);
}

  
}
