import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ParametrizationRoutingModule } from './parametrization-routing.module';
import { DoctorProfileComponent } from './doctor-profile/doctor-profile.component';

@NgModule({
  declarations: [
    DoctorProfileComponent
  ],
  imports: [
    CommonModule,
    ParametrizationRoutingModule
  ]
})
export class ParametrizationModule { }
