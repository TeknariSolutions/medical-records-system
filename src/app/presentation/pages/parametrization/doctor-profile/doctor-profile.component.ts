import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DoctorProfileDTO } from 'src/app/core/DTOs/app/doctor-profile-dto';
import { DoctorProfileUseCase } from '../../../../infrastructure/use-cases/app/doctor-profile-use-case';
import { NotificationsService } from 'src/app/infrastructure/services/common/notifications/notifications.service';
import { ResponseDTO } from 'src/app/core/DTOs/common/response/response.dto';
import { DropzoneConfigInterface, DropzoneModule } from 'ngx-dropzone-wrapper';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DoctorProfileResponseDTO } from '../../../../core/DTOs/app/doctor-profile-dto';

@Component({
  standalone: true,
  imports:[
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DropzoneModule
  ],
  selector: 'app-doctor-profile',
  templateUrl: './doctor-profile.component.html',
  styleUrls: ['./doctor-profile.component.css']
})
export class DoctorProfileComponent implements OnInit {
  files: File[] = [];
  doctorProfile: DoctorProfileDTO | null = null;
  doctorProfileResponseDTO : DoctorProfileResponseDTO | null =null
  doctorForm!: FormGroup;
  isLoading: boolean = false;
  isEditMode = false;
  modalRef?: any;
  uploadedFiles: File[] = [];
  signaturePreview: string | null = null;
  isImage = true;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private _doctorProfileUseCase: DoctorProfileUseCase,
    private _notificationService: NotificationsService
  ) { }

  ngOnInit(): void {
   this.doctorForm = this.fb.group({
  idDoctorProfile: [0],
  idUser: [0, Validators.required],

  // EDITABLES
  idSpeciality: [0, Validators.required],
  medicalRegistre: ['', Validators.required],
  digitalSignature: [''],
  documentType: [''],
  idDocument: [''],

  // SOLO LECTURA
  email: [{ value: '', disabled: true }],
  name: [{ value: '', disabled: true }],
  secondName: [{ value: '', disabled: true }],
  lastName: [{ value: '', disabled: true }],
  secondLastName: [{ value: '', disabled: true }],
  specialityDescription: [{ value: '', disabled: true }]
});

    const idUser = Number(this.route.snapshot.paramMap.get('idUser'));
    this.loadDoctorProfile(idUser);
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

  // Se ejecuta cuando se agrega un archivo al dropzone
  onFileAdded(fileEvent: any) {
    // Dependiendo de la versión/evento, puede venir como File o como objeto con .file/_file
    const file: File = fileEvent instanceof File
      ? fileEvent
      : fileEvent?.file ?? fileEvent?._file ?? fileEvent;

    if (!file) return;

    // guardamos referencia
    this.uploadedFiles.push(file);

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      // Guardamos el dataURL (base64) en el form y en la vista previa
      this.doctorForm.patchValue({ digitalSignature: base64 });
      this.signaturePreview = base64;
      this.isImage = (file.type ?? '').startsWith('image/');
    };
    reader.readAsDataURL(file);
  }

  // Limpiar firma (botón "Eliminar Firma")
  removeFile(file?: any) {
    // Si se pasa un File explícito, lo removemos del arreglo; si no, limpiamos todo.
    if (file && (file instanceof File || (file && file.name))) {
      this.uploadedFiles = this.uploadedFiles.filter(f => f !== file);
    } else {
      this.uploadedFiles = [];
    }

    // Limpiar preview y campo del form
    this.signaturePreview = null;
    this.isImage = true;
    this.doctorForm.patchValue({ digitalSignature: '' });
  }

  loadDoctorProfile(idUser: number): void {
    this._doctorProfileUseCase.GetDoctorProfileById(idUser).subscribe({
      next: (resp: ResponseDTO) => {
        if (resp && resp.data) {
          this.doctorProfile = resp.data as DoctorProfileResponseDTO;
          this.isEditMode = true;
          this.doctorForm.patchValue(this.doctorProfile);

          // Si la firma ya existe la mostramos en la preview
          if (this.doctorProfile.digitalSignature) {
            // Aseguramos que la preview sea dataURL (si tu backend guarda solo base64 sin prefijo, añade data:image/...;base64, si es necesario)
            this.signaturePreview = this.doctorProfile.digitalSignature.startsWith('data:')
              ? this.doctorProfile.digitalSignature
              : `data:image/png;base64,${this.doctorProfile.digitalSignature}`;

            this.isImage = this.signaturePreview.startsWith('data:image');
          }
        } else {
          this.doctorProfile = null;
          this.isEditMode = false;
          this.doctorForm.reset({ idUser: idUser });
        }
      },
      error: () => {
        this.doctorProfile = null;
        this.isEditMode = false;
        this.doctorForm.reset({ idUser: idUser });
      }
    });
  }

  saveProfile(): void {
    if (this.doctorForm.invalid) return;

    if (this.isEditMode) {
      this._doctorProfileUseCase.UpdateDoctorProfile(this.doctorForm.value).subscribe(() => {
        this._notificationService.showSuccessMessage('Perfil actualizado correctamente ✅');
      });
    } else {
      this._doctorProfileUseCase.CreateDoctorProfile(this.doctorForm.value).subscribe(() => {
        this._notificationService.showSuccessMessage('Perfil creado correctamente ✅');
        this.isEditMode = true;
      });
    }
  }
}
