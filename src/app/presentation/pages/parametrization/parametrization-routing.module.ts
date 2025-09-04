import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UsersComponent } from './users/users.component';
import { PatientsComponent } from './patients/patients.component';
import { CreateUpdatePatientComponent } from './patients/create-update-patient/create-update-patient.component';
import { PatientProceduresComponent } from './patient-procedures/patient-procedures.component';
import { MedicalConsultationComponent } from './patient-procedures/medical-consultation/medical-consultation.component';
import { MedicalHistoriesComponent } from './patient-procedures/medical-histories/medical-histories.component';
import { ConsultationProceduresComponent } from './consultation-procedures/consultation-procedures.component';
import { OrdersComponent } from './consultation-procedures/orders/orders.component';

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
    },
    {
        path: 'patient-procedures',
        component: PatientProceduresComponent
    },
    {
        path: 'medical-consultation-list',
        component: MedicalConsultationComponent
    },
    {
        path: 'medical-history-list/:id',
        component: MedicalHistoriesComponent
    },
    {
        path: 'consultation-procedures',
        component: ConsultationProceduresComponent
    },
    {
        path: 'orders-procedures',
        component: OrdersComponent
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ParametrizationRoutingModule {}