import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';

import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from 'src/app/infrastructure/services/auth/auth.service';
import { JwtDecoderHelper } from 'src/app/infrastructure/helpers/decodec-token.helper';
import { ResponseDTO } from 'src/app/core/DTOs/common/response/response.dto';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone:true,
  imports:[CommonModule,FormsModule,ReactiveFormsModule]
})

export class LoginComponent implements OnInit {

  loginForm: UntypedFormGroup;
  submitted: any = false;
  error: any = '';
  returnUrl: string;
  fieldTextType!: boolean;


  year: number = new Date().getFullYear();

  constructor(
    private formBuilder: FormBuilder,
    private _authService: AuthService,
    private _jwtDecoderHelper: JwtDecoderHelper,
     private route: ActivatedRoute,
    private router: Router, 
  )
     { }

  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required]],
      password: ['', [Validators.required]],
    });
  }

  get f() { return this.loginForm.controls; }

 
  onSubmit() {
    this.submitted = true;
  
    this._authService.login(this.loginForm.controls['email'].value, this.loginForm.controls['password'].value).subscribe((response: ResponseDTO) => {
    this.router.navigate(['/']);

      if (response.isSuccess) {
        const authToken = response.data;
        localStorage.setItem('authToken', authToken);
        const claims = this._jwtDecoderHelper.getDecodedAccessToken(response.data) as any;
      } 
    });
  }
  
  
  toggleFieldTextType() {
    this.fieldTextType = !this.fieldTextType;
  }
}
