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
import { UsersUseCase } from 'src/app/infrastructure/use-cases/app/users.use-case';
import { CloseConsultationUseCase } from 'src/app/infrastructure/use-cases/app/close-consultation.use-case';
import { Cie10UseCase } from 'src/app/infrastructure/use-cases/common/cie10.use-case';

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

  submitted = false;

  // Listas para selects
  modalitiesAttention: any[] = [];

  // Autocomplete de CUPS
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

  doctors: any[] = [];
  consultationFinalities: any[] = [];
  groupServices = [
    { code: '01', description: 'Consulta externa' },
    { code: '02', description: 'Apoyo diagnóstico y complementación terapéutica' },
    { code: '03', description: 'Internación' },
    { code: '04', description: 'Quirúrgico' },
    { code: '05', description: 'Atención inmediata' }
  ];

  cie10Suggestions: any[] = [];
  showCie10Dropdown = false;


  codeSuggestions: any[] = [];
  descriptionSuggestions: any[] = [];
  showCodeDropdown = false;
  showDescriptionDropdown = false;
  paginator: PaginatorDTO = { pageIndex: 1, pageSize: 1000 };


  constructor(
    private fb: FormBuilder,
    private bsModalRef: BsModalRef,
    private paraclinicsUseCase: ParaclinicsUseCase,
    private _cupsCodeUseCase: CupsCodeUseCase,
    private _modalityAttentionUseCase: ModalityAttentionUseCase,
    private _usersUseCase: UsersUseCase,
    private _closeConsultationUseCase: CloseConsultationUseCase,
    //private _medicalServicesUseCase: MedicalServicesUseCase,
    private _cie10UseCase: Cie10UseCase,
    private cdr: ChangeDetectorRef
  ) { }



  ngOnInit(): void {

    this.form = this.fb.group({
      name: [this.paraclinic?.name || '', Validators.required],
      observations: [this.paraclinic?.observations || ''],
      idCupsCode: [this.paraclinic?.idCupsCode || null, Validators.required],
      cupsName: ['', Validators.required],
      idModalityAttention: [this.paraclinic?.idModalityAttention || null, Validators.required],
      isExternal: [this.paraclinic?.isExternal || false],
      codViaIngreso: [this.paraclinic?.codViaIngreso || '', Validators.required],

      idUser: [null, Validators.required],
      idConsultationFinality: [null, Validators.required],
      groupServiceCode: [null, Validators.required],
      cie10Code: ['', Validators.required],             // ← código visible (J45.9)
      cie10Description: ['', Validators.required],      // ← descripción visible (ASMA BRONQUIAL)
      idCieCode: [null],           // ← ID numérico para backend
    });


    // Precargar archivo si existe
    if (this.paraclinic && (this.paraclinic as any).urlFile) {
      this.filePreview = (this.paraclinic as any).urlFile;
      const lower = this.filePreview.toLowerCase();
      this.isImage = lower.endsWith('.png') || lower.endsWith('.jpg') || lower.endsWith('.jpeg') || lower.endsWith('.gif');
    }

    if (this.paraclinic) {
      this.preloadForm();
    }

    // precargar cie10 si existe

    this.preLoadCie10();


    // Cargar lista de modalidades
    this.loadModalityAttention();

    this.loadDoctors();
    this.loadConsultationFinalities();


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

  private preloadForm(): void {

    const paraclinic = this.paraclinic;

    this.form.patchValue({
      name: paraclinic?.name || '',
      observations: paraclinic?.observations || '',
      idCupsCode: paraclinic?.idCupsCode || null,
      cupsName: paraclinic?.cupsName || '',
      idModalityAttention: paraclinic?.idModalityAttention || null,
      isExternal: paraclinic?.isExternal || false,
      codViaIngreso: paraclinic?.codViaIngreso || '',
      idUser: paraclinic?.idUser || null,
      idConsultationFinality: paraclinic?.idConsultationFinality || null,
      groupServiceCode: paraclinic?.groupServiceCode || null,
      idCieCode: paraclinic?.idCIECode || null,
      cie10Code: paraclinic?.codigo || '',
      cie10Description: paraclinic?.nombre || ''
    });

    this.cdr.detectChanges();
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


  loadDoctors(): void {
    const companyId = Number(localStorage.getItem('IdCompany')) || 0;
    this._usersUseCase.GetListDoctors({ pageIndex: 1, pageSize: 100 }, '', '', companyId).subscribe({
      next: (data) => this.doctors = data.results || [],
      error: () => this.doctors = []
    });
  }


  loadConsultationFinalities(): void {
    this._closeConsultationUseCase.GetConsultationFinalities().subscribe({
      next: (data) => this.consultationFinalities = data || [],
      error: () => this.consultationFinalities = []
    });
  }

  // Búsqueda de CUPS 
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

  // Archivos 
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


  save() {

    this.submitted = true;

    if (this.form.invalid) return;

    const now = DateTimeHelper.getLocalDateTimeWithOffset();
    const currentUserId = Number(localStorage.getItem('IdUser')) || 0;

    const dto: ParaclinicsDTO = {
      idParaclinics: this.paraclinic?.idParaclinics ?? 0,
      idPatient: this.idPatient,
      name: this.form.value.name,
      datePerformen: this.paraclinic?.datePerformen ?? now,
      observations: this.form.value.observations || '',

      idCupsCode: this.form.value.idCupsCode,
      idModalityAttention: this.form.value.idModalityAttention,
      idCieCode: this.form.value.idCieCode,
      isExternal: this.form.value.isExternal,
      codViaIngreso: this.form.value.codViaIngreso || '',

      idUser: this.form.value.idUser,
      idConsultationFinality: this.form.value.idConsultationFinality,
      groupServiceCode: this.form.value.groupServiceCode,

      // 🔹 Estos campos el backend los exige (aunque no se usen en update)
      imagePath: null,
      urlFile: null,

      registeredAt: this.paraclinic?.registeredAt ?? now,
      registeredByUserID: this.paraclinic?.registeredByUserID ?? currentUserId,
      updateByUserID: currentUserId,
      updatedAt: now
    };


    const request$ = this.paraclinic
      ? this.paraclinicsUseCase.UpdateParaclinics(dto)
      : this.paraclinicsUseCase.CreateParaclinics(dto, this.file);

    request$.subscribe({
      next: (success) => {
        if (success) {
          this.saved.emit();
          this.bsModalRef.hide();
        }
      },
      error: (err) => {
        console.error('Error al guardar paraclínico:', err);
      }
    });
  }


  onCancel(): void {
    this.bsModalRef.hide();
  }


  // 🔹 EVENTOS DE INPUT
  onCieCodeInput(value: string): void {
    this.form.patchValue({ cie10Description: '' });

    if (value && value.length >= 2) {
      this.searchCie10({ code: value });
    } else {
      this.codeSuggestions = [];
      this.descriptionSuggestions = [];
      this.showCodeDropdown = false;
      this.showDescriptionDropdown = false;
    }
  }

  onCieDescriptionInput(value: string): void {
    this.form.patchValue({ idCieCode: 0 });

    if (value && value.length >= 3) {
      this.searchCie10({ name: value });
    } else {
      this.codeSuggestions = [];
      this.descriptionSuggestions = [];
      this.showCodeDropdown = false;
      this.showDescriptionDropdown = false;
    }
  }

  // 🔹 BÚSQUEDA CIE10 (idéntico a Diagnósticos)

  searchCie10(filters: { code?: string; name?: string }): void {
    this._cie10UseCase
      .GetListCIECodes(this.paginator, filters.name || '', filters.code || '')
      .subscribe({
        next: (data: TableResultDTO) => {

          const results = data?.results || [];
          this.codeSuggestions = results;
          this.descriptionSuggestions = results;
          this.showCodeDropdown = this.codeSuggestions.length > 0;
          this.showDescriptionDropdown = this.descriptionSuggestions.length > 0;
          this.cdr.detectChanges();
        },
        error: () => {
          this.codeSuggestions = [];
          this.descriptionSuggestions = [];
          this.showCodeDropdown = false;
          this.showDescriptionDropdown = false;
        },
      });
  }


  // CIE10
  selectCie10(item: any): void {
    this.form.patchValue({
      idCieCode: item.idCIECode,
      cie10Code: item.codigo,
      cie10Description: item.nombre
    });

    this.codeSuggestions = [];
    this.descriptionSuggestions = [];
    this.showCodeDropdown = false;
    this.showDescriptionDropdown = false;
    this.cdr.detectChanges();
  }


  private preLoadCie10(): void {
    if (this.paraclinic?.idCieCode) {
      const paginator: PaginatorDTO = { pageIndex: 1, pageSize: 1 };

      this._cie10UseCase
        .GetListCIECodes(paginator, '', this.paraclinic.idCieCode.toString())
        .subscribe({
          next: (data: any) => {
            const cie = data?.results?.find((x: any) => x.idCIECode === this.paraclinic?.idCieCode);
            if (cie) {
              this.form.patchValue({
                idCieCode: cie.idCIECode,
                cie10Code: cie.codigo,
                cie10Description: cie.nombre
              });
              this.cdr.detectChanges();
            }
          },
          error: (err) => console.error('Error al precargar CIE10:', err),
        });
    }
  }

}
