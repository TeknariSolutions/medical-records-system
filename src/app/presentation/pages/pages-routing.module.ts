import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard/dashboard.component';

const routes: Routes = [
  {
    path: "",
    component: DashboardComponent
  },
  { path: 'parametrization', loadChildren: () => import('./parametrization/parametrization.module').then(m => m.ParametrizationModule) },
  { path: 'medicines', loadChildren: () => import('./medicine/medicine.module').then(m => m.MedicineModule) },
  { path: 'codes', loadChildren: () => import('./Codes/codes.module').then(m => m.CodesModule) },
  { path: 'cups', loadChildren: () => import('./CUPS/cups.module').then(m => m.CupsModule) },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PagesRoutingModule { }