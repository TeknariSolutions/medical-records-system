import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ParaclinicsDTO } from 'src/app/core/DTOs/app/paraclinics.dto';
import { ParaclinicsUseCase } from 'src/app/infrastructure/use-cases/app/paraclinics.use-case';
import { DateTimeHelper } from 'src/app/infrastructure/helpers/date-time.helper';
import { DropzoneConfigInterface, DropzoneModule } from 'ngx-dropzone-wrapper';


@Component({
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    DropzoneModule
  ],
  selector: 'app-create-update-paraclinics',
  templateUrl: './create-update-paraclinics.component.html',
  styleUrl: './create-update-paraclinics.component.css'
})
export class CreateUpdateParaclinicsComponent implements OnInit {

  @Input() paraclinic?: ParaclinicsDTO;
  @Input() idPatient!: number;
  @Output() saved = new EventEmitter<void>();

  form!: FormGroup;
  file?: File;

  fileName: string | null = null;
  filePreview: string | null = null;

  isImage = true;

  public dropzoneConfig: DropzoneConfigInterface = {
    clickable: true,
    addRemoveLinks: true,
    previewsContainer: false,
    url: 'no-url',
    autoProcessQueue: false,
    acceptedFiles: 'image/*,application/pdf',
    maxFiles: 1
  };


  constructor(
    private fb: FormBuilder,
    private bsModalRef: BsModalRef,
    private paraclinicsUseCase: ParaclinicsUseCase
  ) { }


  ngOnInit(): void {
    this.form = this.fb.group({
      name: [this.paraclinic?.name || '', Validators.required],
      observations: [this.paraclinic?.observations || ''],
    });

    // Si viene de backend un archivo ya cargado
    if (this.paraclinic && (this.paraclinic as any).urlFile) {
      this.filePreview = (this.paraclinic as any).urlFile;

      const lower = this.filePreview.toLowerCase();
      this.isImage = lower.endsWith('.png') || lower.endsWith('.jpg') || lower.endsWith('.jpeg') || lower.endsWith('.gif');
    }
  }


  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.file = input.files[0];
    }
  }


  onFileAdded(fileEvent: any) {
    const file: File = fileEvent instanceof File
      ? fileEvent
      : fileEvent?.file ?? fileEvent?._file ?? fileEvent;

    if (!file) return;

    this.file = file;
    this.fileName = file.name;

    const reader = new FileReader();
    reader.onload = () => {
      this.filePreview = reader.result as string;
    };
    reader.readAsDataURL(file);
  }


  removeFile() {
    this.file = undefined;
    this.filePreview = null;
    this.isImage = true;
  }


  save() {
    if (this.form.invalid) return;

    const dto: ParaclinicsDTO = {
      idParaclinics: this.paraclinic?.idParaclinics,
      idPatient: this.idPatient,
      name: this.form.value.name,
      datePerformen: DateTimeHelper.getLocalDateTimeWithOffset(),
      observations: this.form.value.observations,
      registeredByUserID: this.paraclinic?.registeredByUserID ?? Number(localStorage.getItem('IdUser')),
      registeredAt: this.paraclinic?.registeredAt ?? DateTimeHelper.getLocalDateTimeWithOffset(),
      updateByUserID: Number(localStorage.getItem('IdUser')),
      updatedAt: DateTimeHelper.getLocalDateTimeWithOffset(),

      imagePath: (this.paraclinic as any)?.imagePath || '',
      urlFile: (this.paraclinic as any)?.urlFile || ''
    };

    if (this.paraclinic) {
      this.paraclinicsUseCase.UpdateParaclinics(dto).subscribe(success => {
        if (success) {
          this.saved.emit();
          this.bsModalRef.hide();
        }
      });
    } else {
      this.paraclinicsUseCase.CreateParaclinics(dto, this.file).subscribe(success => {
        if (success) {
          this.saved.emit();
          this.bsModalRef.hide();
        }
      });
    }
  }

  onCancel(): void {
    this.bsModalRef.hide();
  }
}
