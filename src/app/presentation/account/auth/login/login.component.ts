import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';

import { Store } from '@ngrx/store';
import { ActivatedRoute, Router } from '@angular/router';
import { login } from 'src/app/store/Authentication/authentication.actions';
import { CommonModule } from '@angular/common';
import { AuthenticationService } from 'src/app/core/services/auth.service';
import { AuthfakeauthenticationService } from 'src/app/core/services/authfake.service';
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

/**
 * Login component
 */
export class LoginComponent implements OnInit {

  loginForm: UntypedFormGroup;
  submitted: any = false;
  error: any = '';
  returnUrl: string;
  fieldTextType!: boolean;

  // set the currenr year
  year: number = new Date().getFullYear();

  constructor(
    private formBuilder: FormBuilder,
    private _authService: AuthService,
    private _jwtDecoderHelper: JwtDecoderHelper,
     private route: ActivatedRoute,
      private router: Router, 
      //private authenticationService: AuthenticationService, 
      private store: Store,
    //private authFackservice: AuthfakeauthenticationService
  )
     { }

  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required]],
      password: ['', [Validators.required]],
    });
  }

  // convenience getter for easy access to form fields
  get f() { return this.loginForm.controls; }

 
  onSubmit() {
    this.submitted = true;
  
   /*  if (this.loginForm.invalid) {
      return;
    } */

    this._authService.login(this.loginForm.controls['email'].value, this.loginForm.controls['password'].value).subscribe((response: ResponseDTO) => {
      
      this.router.navigate(['/']);
      console.log(response);

      if (response.isSuccess) {
        const claims = this._jwtDecoderHelper.getDecodedAccessToken(response.data) as any;
        
        
      }
    });
  }
  
  
  toggleFieldTextType() {
    this.fieldTextType = !this.fieldTextType;
  }
}
