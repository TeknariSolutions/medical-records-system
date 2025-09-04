import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CIE10ListComponent } from './cie10-list/cie10-list.component';

const routes: Routes = [
    {
        path: 'list-CIE10',
        component: CIE10ListComponent
    }
]

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class CodesRoutingModule { }