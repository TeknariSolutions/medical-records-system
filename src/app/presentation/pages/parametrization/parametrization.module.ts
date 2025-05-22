import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ParametrizationRoutingModule } from './parametrization-routing.module';
import { CreateUpdateUserComponent } from './users/create-update-user/create-update-user.component';

@NgModule({
  declarations: [
    //CreateUpdateUserComponent
  ],
  imports: [
    CommonModule,
    ParametrizationRoutingModule
  ]
})
export class ParametrizationModule { }
