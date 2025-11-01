import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MedicalEquipmentListComponent } from './medical-equipment-list/medical-equipment-list.component';


const routes: Routes = [
    {
        path: 'list-equipments',
        component: MedicalEquipmentListComponent
    }
]

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class MedicalEquipmentRoutingModule { }