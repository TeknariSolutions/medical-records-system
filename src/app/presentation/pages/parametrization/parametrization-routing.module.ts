import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UsersComponent } from './users/users.component';
import { PatientsComponent } from './patients/patients.component';
import { CreateUpdatePatientComponent } from './patients/create-update-patient/create-update-patient.component';

const routes: Routes = [
    {
        path: 'users',
        component: UsersComponent
    },
    {
        path: 'patients',
        component: PatientsComponent
    },
    {
        path: 'create-update-patient',
        component: CreateUpdatePatientComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ParametrizationRoutingModule {}