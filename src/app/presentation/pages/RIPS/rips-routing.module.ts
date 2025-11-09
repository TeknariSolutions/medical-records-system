import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RipsListComponent } from './rips-list/rips-list/rips-list.component';

const routes: Routes = [
    {
        path: 'list-RIPS',
        component: RipsListComponent
    }
]

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class RipsRoutingModule { }