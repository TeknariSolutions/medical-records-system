import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { NgSelectModule } from '@ng-select/ng-select';
import { RolDTO } from 'src/app/core/DTOs/app/rol.dto';
import { UserDTO } from 'src/app/core/DTOs/app/user.dto';
import { PaginatorDTO } from 'src/app/core/DTOs/common/paginator/paginator.dto';
import { TableResultDTO } from 'src/app/core/DTOs/common/table-result/table-result.dto';
import { RolesUseCase } from 'src/app/infrastructure/use-cases/app/roles.use-case';
import { UsersUseCase } from 'src/app/infrastructure/use-cases/app/users.use-case';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgSelectModule 
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

  roles: RolDTO[] = [];

  submitted = false;
  
  constructor(
    private formBuilder: FormBuilder,
    private _userUseCase: UsersUseCase,
    private _rolesUseCase: RolesUseCase,
    private router: Router,
    public bsModalRef: BsModalRef,
  ) {}

  ngOnInit() {
    this.initForm();

    if (this.userData) {
      this.isEditMode = true;
      this.userForm.patchValue({
        email: this.userData.email,
        idRol: this.userData.idRol,
        name: this.userData.name,
        secondName: this.userData.secondName,
        lastName: this.userData.lastName,
        secondLastName: this.userData.secondLastName,
        isActive: this.userData.isActive
      });
    }

    this.loadRoles();
  }

   private initForm(): void {
    this.userForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: [this.userData ? '' : '', this.userData ? [] : [Validators.required]],
      idCompany: 1,
      idRol: [null, Validators.required],
      name: ['', [Validators.required]],
      secondName: [''],
      lastName: ['', [Validators.required]],
      secondLastName: [''],
      isActive: true
    });
  }

  onSubmit(): void {
    this.submitted = true;
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
        password: this.isEditMode ? this.userData!.password : password,
        idCompany,
        idRol,
        name,
        secondName,
        lastName,
        secondLastName,
        isActive,
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

  loadRoles() {
    const paginator: PaginatorDTO = {
      pageIndex: 1,
      pageSize: 1000
    };

    this._rolesUseCase.GetListRoles(paginator, '').subscribe({
      next: (data: TableResultDTO) => {
        this.roles = data.results;

        // Si estamos en modo edición, encontrar el ID del rol por descripción
        if (this.isEditMode && this.userData?.roleDescription) {
          const matchedRole = this.roles.find(r => r.description === this.userData!.roleDescription);
          if (matchedRole) {
            this.userForm.patchValue({ idRol: matchedRole.idRol });
          }
        }
      }
    });
  }


}
