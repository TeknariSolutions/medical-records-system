import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { MedicalHistoryDTO } from 'src/app/core/DTOs/app/medical-history.dto';
import { MedicalHistoryUseCase } from 'src/app/infrastructure/use-cases/app/medical-history.use-case';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  selector: 'app-create-update-medical-history',
  templateUrl: './create-update-medical-history.component.html',
  styleUrl: './create-update-medical-history.component.css'
})
export class CreateUpdateMedicalHistoryComponent {

  @Input() lastMedicalHistory!: MedicalHistoryDTO;
  @Input() idPatient!: number;
  @Input() idUser!: number;

  form!: FormGroup;

  isSmoker = false;
  isAlcoholConsumer = false;
  isDrugUser = false;

  @Input() isEditMode: boolean = false;

  constructor(
    private fb: FormBuilder,
    public bsModalRef: BsModalRef,
    private _medicalHistoryUseCase: MedicalHistoryUseCase
  ) { }

  ngOnInit(): void {

    this.form = this.fb.group({
      pathologicalHistory: [this.lastMedicalHistory?.pathologicalHistory || ''],
      surgicalHistory: [this.lastMedicalHistory?.surgicalHistory || ''],
      allergicHistory: [this.lastMedicalHistory?.allergicHistory || ''],
      pharmacologicalHistory: [this.lastMedicalHistory?.pharmacologicalHistory || ''],
      familyHistory: [this.lastMedicalHistory?.familyHistory || ''],
      gynecoObstetricHistory: [this.lastMedicalHistory?.gynecoObstetricHistory || ''],
      occupationalHistory: [this.lastMedicalHistory?.occupationalHistory || ''],
      psychiatricHistory: [this.lastMedicalHistory?.psychiatricHistory || ''],
      traumaticHistory: [this.lastMedicalHistory?.traumaticHistory || ''],
      immunologicalHistory: [this.lastMedicalHistory?.immunologicalHistory || ''],
      observations: [this.lastMedicalHistory?.observations || ''],
      smoker: [this.lastMedicalHistory?.smoker || false],
      smokingYears: [this.lastMedicalHistory?.smokingYears || 0],
      cigarettesPerDay: [this.lastMedicalHistory?.cigarettesPerDay || 0],
      smokingIndex: [this.lastMedicalHistory?.smokingIndex || 0],
      smokigDevice: [this.lastMedicalHistory?.smokigDevice || ''], // 🆕 nuevo campo
      alcoholConsumer: [this.lastMedicalHistory?.alcoholConsumer || false],
      alcoholFrequency: [this.lastMedicalHistory?.alcoholFrequency || ''],
      drugUse: [this.lastMedicalHistory?.drugUse || false],
      drugDetails: [this.lastMedicalHistory?.drugDetails || '']
    });


    // Flags iniciales
    this.isSmoker = this.form.get('smoker')?.value;
    this.isAlcoholConsumer = this.form.get('alcoholConsumer')?.value;
    this.isDrugUser = this.form.get('drugUse')?.value;

    // Suscripciones
    this.form.get('smoker')?.valueChanges.subscribe(value => {
      this.isSmoker = value;
    });

    this.form.get('alcoholConsumer')?.valueChanges.subscribe(value => {
      this.isAlcoholConsumer = value;
    });

    this.form.get('drugUse')?.valueChanges.subscribe(value => {
      this.isDrugUser = value;
    });

    // Suscripción para calcular IPA
    this.form.get('smokingYears')?.valueChanges.subscribe(() => this.calculateSmokingIndex());
    this.form.get('cigarettesPerDay')?.valueChanges.subscribe(() => this.calculateSmokingIndex());

    // Suscripción fumador -> mostrar campos adicionales
    this.form.get('smoker')?.valueChanges.subscribe(value => {
      this.isSmoker = value;
      if (!value) {
        this.form.patchValue({
          smokingYears: 0,
          cigarettesPerDay: 0,
          smokingIndex: 0,
          smokingDevice: ''   // limpiamos el campo nuevo
        });
      }
    });
  }

  private calculateSmokingIndex(): void {
    const years = this.form.get('smokingYears')?.value || 0;
    const perDay = this.form.get('cigarettesPerDay')?.value || 0;

    const ipa = (perDay * years) / 20;
    this.form.get('smokingIndex')?.setValue(ipa, { emitEvent: false });
  }

  save(): void {
    if (this.form.invalid) return;

    const dto: MedicalHistoryDTO = {
      ...this.form.value,
      idMedicalHistory: this.lastMedicalHistory?.idMedicalHistory || 0, // usa el ID original si estás editando
      idPatient: this.idPatient,
      createdBy: this.idUser,
      createdAt: this.lastMedicalHistory?.createdAt || new Date(),
      updatedBy: this.idUser,
      updatedAt: new Date()
    };

    if (this.isEditMode) {
      // Editar
      this._medicalHistoryUseCase.UpdateMedicalHistory(dto).subscribe(() => {
        this.bsModalRef.hide();
      });
    } else {
      // Crear
      this._medicalHistoryUseCase.CreateMedicalHistory(dto).subscribe(() => {
        this.bsModalRef.hide();
      });
    }
  }

  cancel(): void {
    this.bsModalRef.hide();
  }
}