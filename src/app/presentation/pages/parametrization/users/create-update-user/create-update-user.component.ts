import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { UserDTO } from 'src/app/core/DTOs/app/user.dto';
import { UsersUseCase } from 'src/app/infrastructure/use-cases/app/users.use-case';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule 
  ],
  selector: 'app-create-update-user',
  templateUrl: './create-update-user.component.html',
  styleUrl: './create-update-user.component.css'
})
export class CreateUpdateUserComponent implements OnInit {

  userForm: FormGroup;
  onClose: (result: string) => void = () => { };

  userData?: UserDTO;
  isEditMode: boolean = false;
  
  constructor(
    private formBuilder: FormBuilder,
    private _userUseCase: UsersUseCase,
    private router: Router,
    public bsModalRef: BsModalRef,
  ) {

  }

  ngOnInit() {
    this.initForm();
  }

   private initForm(): void {
    this.userForm = this.formBuilder.group({
      email: ['', [Validators.required]],
      password: ['', [Validators.required]],
      idCompany: 1,
      idRol: [0, [Validators.required]],
      name: ['', [Validators.required]],
      secondName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      secondLastName: ['', [Validators.required]],
      isActive: ['', [Validators.required]],
    });
  }

  onSubmit(): void {
    if (this.userForm.valid) {
      const email = this.userForm.value.email;
      const password = this.userForm.value.password;
      const idCompany = this.userForm.value.idCompany;
      const idRol = this.userForm.value.idRol;
      const name = this.userForm.value.name;
      const secondName = this.userForm.value.secondName;
      const lastName = this.userForm.value.lastName;
      const secondLastName = this.userForm.value.secondLastName;
      const isActive = this.userForm.value.isActive;
      
      

      const userData: UserDTO = {
        idUser: this.isEditMode ? this.userData!.idUser : 0,
        email,
        password,
        idCompany,
        idRol,
        name,
        secondName,
        lastName,
        secondLastName,
        isActive
      };

      const operation = this.isEditMode
        ? this._userUseCase.UpdateUser(userData)
        : this._userUseCase.CreateUser(userData);

      operation.subscribe({
        next: () => {
          this.router.navigate(['/parametrization/users']);
          this.onClose('refresh');
          this.bsModalRef.hide();
        },
        error: (err) => {
          console.error('Error al crear usuario:', err);
        }
      });
    }
  }

  onCancel(): void {
    this.bsModalRef.hide();
  }


}
