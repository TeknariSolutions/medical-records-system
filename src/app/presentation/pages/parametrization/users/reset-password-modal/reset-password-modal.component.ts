import { Component, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-reset-password-modal',
  templateUrl: './reset-password-modal.component.html',
  styleUrls: ['./reset-password-modal.component.css'],
  imports: [CommonModule, ReactiveFormsModule]
})
export class ResetPasswordModalComponent {

  userId!: number;
  submitted = false;
  form: FormGroup;

  onClose: EventEmitter<{ idUser: number, password: string }> = new EventEmitter();

  constructor(
    public bsModalRef: BsModalRef,
    private fb: FormBuilder
  ) {
    this.form = this.fb.group({
      password: ['', Validators.required]
    });
  }

  submit() {
    this.submitted = true;

    if (this.form.invalid) return;

    this.onClose.emit({
      idUser: this.userId,
      password: this.form.value.password
    });

    this.bsModalRef.hide();
  }

  close() {
    this.bsModalRef.hide();
  }
}
