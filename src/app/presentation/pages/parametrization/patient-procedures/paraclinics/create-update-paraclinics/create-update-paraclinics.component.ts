import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ParaclinicsDTO } from 'src/app/core/DTOs/app/paraclinics.dto';
import { ParaclinicsUseCase } from 'src/app/infrastructure/use-cases/app/paraclinics.use-case';
import { DateTimeHelper } from 'src/app/infrastructure/helpers/date-time.helper';


@Component({
  standalone: true,
   imports: [
      CommonModule,
      FormsModule,
      ReactiveFormsModule,
      RouterModule,
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

  constructor(
    private fb: FormBuilder,
    private bsModalRef: BsModalRef,
    private paraclinicsUseCase: ParaclinicsUseCase
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      name: [this.paraclinic?.name || '', Validators.required],
      observations: [this.paraclinic?.observations || ''],
    });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.file = input.files[0];
    }
  }

  save() {
    if (this.form.invalid) return;

    const dto: ParaclinicsDTO = {
      idParaclinics: this.paraclinic?.idParaclinics,
      idPatient: this.idPatient,
      name: this.form.value.name,
      datePerformen: DateTimeHelper.getLocalDateTimeWithOffset(),
      observations: this.form.value.observations,
      registeredByUserID: Number(localStorage.getItem('IdUser')),
      registeredAt: DateTimeHelper.getLocalDateTimeWithOffset(),
      updateByUserID: this.paraclinic ? Number(localStorage.getItem('IdUser')) : undefined,
      updatedAt: this.paraclinic ? DateTimeHelper.getLocalDateTimeWithOffset() : undefined
    };

    if (this.paraclinic) {
      // Update (no se envía archivo aquí, a menos que el backend lo soporte)
      this.paraclinicsUseCase.UpdateParaclinics(dto).subscribe(success => {
        if (success) {
          this.saved.emit();
          this.bsModalRef.hide();
        }
      });
    } else {
      // Create
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
