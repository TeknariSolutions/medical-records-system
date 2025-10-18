import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CupsListComponent } from './cups-list/cups-list.component';

const routes: Routes = [
    {
        path: 'list-cups',
        component: CupsListComponent
    }
]

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class CupsRoutingModule { }