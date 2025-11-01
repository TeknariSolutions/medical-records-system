import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { DropzoneConfigInterface, DropzoneModule } from 'ngx-dropzone-wrapper';
import { ParaclinicsDTO } from 'src/app/core/DTOs/app/paraclinics.dto';
import { ParaclinicsUseCase } from 'src/app/infrastructure/use-cases/app/paraclinics.use-case';
import { DateTimeHelper } from 'src/app/infrastructure/helpers/date-time.helper';
import { PaginatorDTO } from 'src/app/core/DTOs/common/paginator/paginator.dto';
import { TableResultDTO } from 'src/app/core/DTOs/common/table-result/table-result.dto';
import { CupsCodeUseCase } from 'src/app/infrastructure/use-cases/common/cups-code.use.case';
import { ModalityAttentionUseCase } from 'src/app/infrastructure/use-cases/common/modality-attention.use-case';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, DropzoneModule],
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

  // 🔹 Listas para selects
  modalitiesAttention: any[] = [];

  // 🔹 Autocomplete de CUPS
  cupsSuggestions: any[] = [];
  showCupsDropdown = false;
  cupsPaginator: PaginatorDTO = { pageIndex: 1, pageSize: 10 };
  totalCupsPages = 1;

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
    private paraclinicsUseCase: ParaclinicsUseCase,
    private _cupsCodeUseCase: CupsCodeUseCase,
    private _modalityAttentionUseCase: ModalityAttentionUseCase,
    private cdr: ChangeDetectorRef
  ) {}

  
  ngOnInit(): void {
    this.form = this.fb.group({
      name: [this.paraclinic?.name || '', Validators.required],
      observations: [this.paraclinic?.observations || ''],
      idCupsCode: [this.paraclinic?.idCupsCode || null, Validators.required],
      cupsName: [''],
      idModalityAttention: [this.paraclinic?.idModalityAttention || null, Validators.required],
      isExternal: [this.paraclinic?.isExternal || false],
      codViaIngreso: [this.paraclinic?.codViaIngreso || '']
    });

    // Precargar archivo si existe
    if (this.paraclinic && (this.paraclinic as any).urlFile) {
      this.filePreview = (this.paraclinic as any).urlFile;
      const lower = this.filePreview.toLowerCase();
      this.isImage = lower.endsWith('.png') || lower.endsWith('.jpg') || lower.endsWith('.jpeg') || lower.endsWith('.gif');
    }

    // Cargar lista de modalidades
    this.loadModalityAttention();

    // Si hay un CUPS asignado, obtener su descripción
    if (this.paraclinic?.idCupsCode) {
      this._cupsCodeUseCase.GetCUPSCodeById(this.paraclinic.idCupsCode).subscribe({
        next: (cups) => {
          if (cups) {
            this.form.patchValue({
              cupsName: `${cups.code} - ${cups.name}`
            });
            this.cdr.detectChanges();
          }
        },
        error: (err) => console.error('Error al cargar CUPS por ID', err)
      });
    }
  }

  
  loadModalityAttention(): void {
    this._modalityAttentionUseCase.GetListModalityAttention().subscribe({
      next: (data) => {
        this.modalitiesAttention = data || [];
      },
      error: (err) => {
        console.error('Error al cargar modalidades de atención', err);
        this.modalitiesAttention = [];
      }
    });
  }

  /** 🔍 Búsqueda de CUPS */
  onCupsInput(value: string) {
    if (value && value.length >= 2) {
      this.cupsPaginator.pageIndex = 1;
      this.searchCups(value);
    } else {
      this.cupsSuggestions = [];
      this.showCupsDropdown = false;
    }
  }

  searchCups(term: string) {
    const isCode = /^[0-9]+$/.test(term);
    this._cupsCodeUseCase
      .GetListCUPS_Codes(this.cupsPaginator, isCode ? term : '', !isCode ? term : '')
      .subscribe({
        next: (data: TableResultDTO) => {
          this.cupsSuggestions = data.results || [];
          this.totalCupsPages = data.totalRecords || 1;
          this.showCupsDropdown = this.cupsSuggestions.length > 0;
          this.cdr.detectChanges();
        },
        error: () => {
          this.cupsSuggestions = [];
          this.showCupsDropdown = false;
        }
      });
  }

  selectCups(cups: any) {
    this.form.patchValue({
      idCupsCode: cups.idCupsCode,
      cupsName: `${cups.code} - ${cups.name}`
    });
    this.showCupsDropdown = false;
    this.cdr.detectChanges();
  }

  nextCupsPage() {
    if (this.cupsPaginator.pageIndex < (this.totalCupsPages || 1)) {
      this.cupsPaginator.pageIndex++;
      this.searchCups(this.form.get('cupsName')?.value);
    }
  }

  previousCupsPage() {
    if (this.cupsPaginator.pageIndex > 1) {
      this.cupsPaginator.pageIndex--;
      this.searchCups(this.form.get('cupsName')?.value);
    }
  }

  /** 🧾 Archivos */
  onFileAdded(fileEvent: any) {
    const file: File = fileEvent instanceof File ? fileEvent : fileEvent?.file ?? fileEvent?._file ?? fileEvent;
    if (!file) return;
    this.file = file;
    this.fileName = file.name;
    const reader = new FileReader();
    reader.onload = () => (this.filePreview = reader.result as string);
    reader.readAsDataURL(file);
  }

  removeFile() {
    this.file = undefined;
    this.filePreview = null;
    this.isImage = true;
  }

  /** 💾 Guardar */
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
      urlFile: (this.paraclinic as any)?.urlFile || '',
      idCupsCode: this.form.value.idCupsCode,
      idModalityAttention: this.form.value.idModalityAttention,
      isExternal: this.form.value.isExternal,
      codViaIngreso: this.form.value.codViaIngreso
    };

    const request$ = this.paraclinic
      ? this.paraclinicsUseCase.UpdateParaclinics(dto)
      : this.paraclinicsUseCase.CreateParaclinics(dto, this.file);

    request$.subscribe(success => {
      if (success) {
        this.saved.emit();
        this.bsModalRef.hide();
      }
    });
  }

  onCancel(): void {
    this.bsModalRef.hide();
  }
}
