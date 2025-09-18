import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, UntypedFormGroup, Validators } from '@angular/forms';

import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthUseCase } from 'src/app/infrastructure/use-cases/auth/auth.use-case';
import { AlertModule } from 'ngx-bootstrap/alert';
import { JwtDecoderHelper } from 'src/app/infrastructure/helpers/decodec-token.helper';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AlertModule
  ],
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})

export class LoginComponent implements OnInit {

  loginForm: UntypedFormGroup;
  submitted: any = false;
  error: any = '';
  returnUrl: string;
  fieldTextType!: boolean;

  year: number = new Date().getFullYear();

  loginFailed = false;
  loading = false;

  constructor(
    private formBuilder: FormBuilder,
    private _authUseCase: AuthUseCase,
    private router: Router,
    private jwtHelper: JwtDecoderHelper
  ) { }

  ngOnInit() {
    this.initForm();

    const token = localStorage.getItem('authToken');
    if (token) {
      this.router.navigate(['/parametrization/patients']); // lo manda a la página principal
    }
  }

  private initForm(): void {
    this.loginForm = this.formBuilder.group({
      userName: ['', [Validators.required]],
      password: ['', [Validators.required]],
    });
  }

  get f() { return this.loginForm.controls; }

    onSubmit() {
    this.submitted = true;
    this.loginFailed = false;

    if (this.loginForm.valid) {
      this.loading = true;

      const { userName, password } = this.loginForm.value;

      this._authUseCase.login(userName, password).subscribe({
        next: (response: any) => {
          this.loading = false;

          const token = localStorage.getItem('authToken');

          if (token) {
            const decoded = this.jwtHelper.getDecodedAccessToken(token);

            if (decoded && decoded.IdUser && decoded.IdCompany && decoded.IdRol) {
              localStorage.setItem('IdUser', decoded.IdUser);
              localStorage.setItem('IdCompany', decoded.IdCompany);
              localStorage.setItem('IdRol', decoded.IdRol);
            }

            this.router.navigate(['/parametrization/patients']);
          } else {
            this.loginFailed = true;
          }
        },
        error: err => {
          this.loading = false;
          this.loginFailed = true;
          console.error('Error al iniciar sesión', err);
        }
      });
    }
  }

  toggleFieldTextType() {
    this.fieldTextType = !this.fieldTextType;
  }
}
