import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DropzoneConfigInterface, DropzoneModule } from 'ngx-dropzone-wrapper';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { DoctorProfileDTO, DoctorProfileResponseDTO } from 'src/app/core/DTOs/app/doctor-profile-dto';
import { DoctorProfileUseCase } from 'src/app/infrastructure/use-cases/app/doctor-profile-use-case';
import { NotificationsService } from 'src/app/infrastructure/services/common/notifications/notifications.service';
import { ResponseDTO } from 'src/app/core/DTOs/common/response/response.dto';
import { NgSelectModule } from '@ng-select/ng-select';
import { SpecialitiesUseCase } from 'src/app/infrastructure/use-cases/app/specialities.use-case';
import { SpecialityDTO } from 'src/app/core/DTOs/app/speciality.dto';
import { PaginatorDTO } from 'src/app/core/DTOs/common/paginator/paginator.dto';

@Component({
  standalone: true,
  imports:[
    CommonModule, 
    FormsModule, 
    ReactiveFormsModule, 
    DropzoneModule,
    NgSelectModule
  ],
  selector: 'app-doctor-profile',
  templateUrl: './doctor-profile.component.html',
  styleUrls: ['./doctor-profile.component.css']
})
export class DoctorProfileComponent implements OnInit {
  doctorForm!: FormGroup;
  doctorProfile: DoctorProfileDTO | null = null;
  doctorProfileResponseDTO : DoctorProfileResponseDTO | null = null;

  isLoading = false;
  isEditMode = false;
  signaturePreview: string | null = null;
  isImage = true;
  uploadedFiles: File[] = [];

  idUser!: number;
  onClose: (result: string) => void = () => {};

  paginator: PaginatorDTO = { pageIndex: 1, pageSize: 1000 };

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

  // Especialidades médicas
  /* medicalSpecialities = [
    { value: 1, label: 'Medicina General' },
    { value: 2, label: 'Cardiología' },
    { value: 3, label: 'Dermatología' },
    { value: 4, label: 'Ginecología y Obstetricia' },
    { value: 5, label: 'Pediatría' },
    { value: 6, label: 'Oftalmología' },
    { value: 7, label: 'Ortopedia y Traumatología' },
    { value: 8, label: 'Otorrinolaringología' },
    { value: 9, label: 'Psiquiatría' },
    { value: 10, label: 'Neurología' },
    { value: 11, label: 'Endocrinología' },
    { value: 12, label: 'Nefrología' },
    { value: 13, label: 'Oncología' },
    { value: 14, label: 'Neumología' },
    { value: 15, label: 'Urología' },
    { value: 16, label: 'Reumatología' },
    { value: 17, label: 'Cirugía General' },
    { value: 18, label: 'Medicina Interna' },
    { value: 19, label: 'Anestesiología' },
    { value: 20, label: 'Medicina Familiar' },
    { value: 21, label: 'Odontologia' }
  ]; */

  specialities: SpecialityDTO[] = [];

  constructor(
    private fb: FormBuilder,
    private _doctorProfileUseCase: DoctorProfileUseCase,
    private _specialitiesUseCase: SpecialitiesUseCase,
    private _notificationService: NotificationsService,
    public bsModalRef: BsModalRef
  ) {}

  ngOnInit(): void {
    this.doctorForm = this.fb.group({
      idDoctorProfile: [0],
      idUser: [this.idUser, Validators.required],
      idSpeciality: [0, Validators.required],
      medicalRegistre: ['', Validators.required],
      digitalSignature: [''],
      documentType: [''],
      idDocument: [''],
    });

    // consultar si ya existe perfil
    this._doctorProfileUseCase.GetDoctorProfileById(this.idUser).subscribe({
      next: (response) => {
        if (response && response.data) {
          this.doctorProfileResponseDTO = response.data as DoctorProfileResponseDTO;
          this.isEditMode = true;

          this.doctorForm.patchValue(this.doctorProfileResponseDTO);

          // mostrar firma si existe
          if (this.doctorProfileResponseDTO.digitalSignature) {
            this.signaturePreview = this.doctorProfileResponseDTO.digitalSignature.startsWith('data:')
              ? this.doctorProfileResponseDTO.digitalSignature
              : `data:image/png;base64,${this.doctorProfileResponseDTO.digitalSignature}`;
            this.isImage = this.signaturePreview.startsWith('data:image');
          }
        } else {
          this.isEditMode = false; // no tiene perfil, queda en modo crear
        }
      },
      error: () => {
        this.isEditMode = false;
        // opcional: notificación de que no existe perfil
      }
    });

    this.loadSpecialitites();
  }

  
  loadSpecialitites(): void {
    this._specialitiesUseCase.GetListSpecialities(this.paginator, '').subscribe({
      next: (data) => {
        this.specialities = data.results;
      },
      error: () => {
        console.error('Error cargando datos del paciente');
      }
    });
  }

  public dropzoneConfig: DropzoneConfigInterface = {
    clickable: true,
    addRemoveLinks: true,
    previewsContainer: false,
    url: 'no-url',
    autoProcessQueue: false,
    acceptedFiles: 'image/*,application/pdf',
    maxFiles: 1
  };

  onFileAdded(fileEvent: any) {
    const file: File = fileEvent instanceof File
      ? fileEvent
      : fileEvent?.file ?? fileEvent?._file ?? fileEvent;

    if (!file) return;

    this.uploadedFiles.push(file);

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      this.doctorForm.patchValue({ digitalSignature: base64 });
      this.signaturePreview = base64;
      this.isImage = (file.type ?? '').startsWith('image/');
    };
    reader.readAsDataURL(file);
  }

  removeFile(file?: any) {
    this.uploadedFiles = [];
    this.signaturePreview = null;
    this.isImage = true;
    this.doctorForm.patchValue({ digitalSignature: '' });
  }

  saveProfile(): void {
    if (this.doctorForm.invalid) return;

    const operation = this.isEditMode
      ? this._doctorProfileUseCase.UpdateDoctorProfile(this.doctorForm.value)
      : this._doctorProfileUseCase.CreateDoctorProfile(this.doctorForm.value);

    operation.subscribe({
      next: () => {
        this._notificationService.showSuccessMessage(
          this.isEditMode ? 'Perfil actualizado correctamente ✅' : 'Perfil creado correctamente ✅'
        );
        this.onClose('refresh');
        this.bsModalRef.hide();
      },
      error: () => {
        this._notificationService.showErrorMessage('Error al guardar el perfil ❌');
      }
    });
  }

  deleteProfile(): void {
    if (!this.doctorProfileResponseDTO?.idDoctorProfile) return;

    if (confirm('¿Estás seguro de eliminar el perfil del doctor?')) {
      this._doctorProfileUseCase.DeleteDoctorProfile(this.doctorProfileResponseDTO.idDoctorProfile)
        .subscribe({
          next: (res) => {
            if (res.isSuccess) {
              this.onClose('refresh');
              this.bsModalRef.hide();
            }
          },
          error: () => {
            this._notificationService.showErrorMessage('Error al eliminar el perfil');
          }
        });
    }
  }


  onCancel(): void {
    this.bsModalRef.hide();
  }
}
