import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { NgStepperModule } from 'angular-ng-stepper';
import { CdkStepper, CdkStepperModule, StepperSelectionEvent } from '@angular/cdk/stepper';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { PatientDTO } from 'src/app/core/DTOs/app/patient.dto';
import { PatientsUseCase } from 'src/app/infrastructure/use-cases/app/patients.use-case';
import { NgSelectModule } from '@ng-select/ng-select';
import { DataTransferService } from 'src/app/infrastructure/services/common/data-transfer/data-transfer.service';
import { take } from 'rxjs';
import { LocationService } from 'src/app/infrastructure/services/common/location/location.service';

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

  departments: any[] = [];
  cities: any[] = [];

  // Tipos de documento
  documentTypes = [
    { value: 'CC', label: 'Cédula de Ciudadanía' },
    { value: 'TI', label: 'Tarjeta de Identidad' },
    { value: 'CE', label: 'Cédula de Extranjería' },
  ];

  // Generos
  genres = [
    { value: 'M', label: 'Masculino' },
    { value: 'F', label: 'Femenino' },
    { value: 'O', label: 'Otro' },
  ];

  // Tipos de Sangre
  bloodTypes = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];


  constructor(
    private formBuilder: FormBuilder,
    private _patientsUseCase: PatientsUseCase,
    private router: Router,
    public bsModalRef: BsModalRef,
    private _dataTransferService: DataTransferService,
    private locationService: LocationService
  ) {}

  ngOnInit(): void {
    this.initForm();

    this.loadDepartments();

    this._dataTransferService.getData$()
      .pipe(take(1)) // solo una vez, evita acumulación
      .subscribe(patient => {
        if (patient) {
          this.isEditMode = true;
          this.patientData = patient;

          console.log(this.patientData);

          // Transformar la fecha para el input[type="date"]
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
              residenceDepartment: patient.residenceDepartment,
              city: patient.city,
              phoneNumber: patient.phoneNumber,
              phoneNumber2: patient.phoneNumber2,
              email: patient.email,
            },
            medicalInfo: {
              isDisAbility: patient.isDisAbility,
              disAbilityDescription: patient.disAbilityDescription,
              bloodType: patient.bloodType?.trim() || null,
              idEps: patient.idEps,
              stratum: patient.stratum,
              regime: patient.regime,
            },
            aditionalInfo: {
              job: patient.job,
              ethnic: patient.ethnic,
            }
          });
        }

        // Ya se tiene el valor de residenceDepartment en el formulario
        const deptId = patient.residenceDepartment;
        if (deptId) {
          this.onDepartmentChange(deptId);
        }
      });
  }

  ngOnDestroy(): void {
    this._dataTransferService.clearData();
  }

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
        residenceDepartment: ['', Validators.required],
        city: ['', Validators.required],
        phoneNumber: ['', Validators.required],
        phoneNumber2: [''],
        email: ['', [Validators.required, Validators.email]],
      }),

      medicalInfo: this.formBuilder.group({
        isDisAbility: [false, Validators.required],
        disAbilityDescription: [''],
        bloodType: [null, Validators.required],
        idEps: [null, Validators.required],
        stratum: ['', Validators.required],
        regime: ['', Validators.required],
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

  loadDepartments() {
    this.locationService.getDepartments().subscribe({
      next: (res) => {
        this.departments = res;
      },
      error: (err) => {
        console.error('Error cargando departamentos', err);
      }
    });
  }

  onDepartmentChange(departmentId: string) {
    if (!departmentId) {
      this.cities = [];
      this.patientForm.get('contactInfo.city')?.setValue('');
      return;
    }

    this.locationService.getCitiesByDepartmentId(departmentId).subscribe({
      next: (res) => {
        this.cities = res;

        // Si estamos en modo edición y hay una ciudad guardada, precargarla aquí
        if (this.isEditMode && this.patientData?.city) {
          this.patientForm.get('contactInfo.city')?.setValue(this.patientData.city);
        }
      },
      error: (err) => {
        console.error('Error cargando ciudades', err);
        this.cities = [];
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
        residenceDepartment: formValue.contactInfo.residenceDepartment,
        city: formValue.contactInfo.city,
        phoneNumber: String(formValue.contactInfo.phoneNumber),
        phoneNumber2: String(formValue.contactInfo.phoneNumber2 || ''),
        email: formValue.contactInfo.email,
        isDisAbility: formValue.medicalInfo.isDisAbility,
        disAbilityDescription: formValue.medicalInfo.disAbilityDescription,
        bloodType: formValue.medicalInfo.bloodType,
        idEps: Number(formValue.medicalInfo.idEps),
        stratum: formValue.medicalInfo.stratum,
        regime: formValue.medicalInfo.regime,
        job: formValue.aditionalInfo.job,
        ethnic: formValue.aditionalInfo.ethnic,
        idCompany: Number(IdCompany),
        createdBy: Number(IdUser)
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
  
}
