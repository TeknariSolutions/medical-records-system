import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MedicinesComponent } from './medicines/medicines.component';


const routes: Routes = [
    {
        path: 'list-medicines',
        component: MedicinesComponent
    }
]

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class MedicineRoutingModule { }