import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { NgStepperModule } from 'angular-ng-stepper';
import { CdkStepperModule } from '@angular/cdk/stepper';



@Component({
  standalone: true,
  imports: [
    CommonModule,
    NgStepperModule,
    CdkStepperModule,
  ],
  selector: "app-create-update-patient",
  templateUrl: "./create-update-patient.component.html",
  styleUrl: "./create-update-patient.component.css",
})
export class CreateUpdatePatientComponent implements OnInit {


 constructor() { }

 ngOnInit() {
 }

}

