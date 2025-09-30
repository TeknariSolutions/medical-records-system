import { RouterModule, Routes } from '@angular/router';
import { Page404Component } from './extrapages/page404/page404.component';
import { LayoutComponent } from './layouts/layout.component';
import { LoginComponent } from './presentation/account/auth/login/login.component';
import { AuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
     {
        path: "",
        redirectTo: "auth/login",
        pathMatch: "full"
    }, 
    { path: 'auth/login', component: LoginComponent},
    {
        path: "",
        component: LayoutComponent,
        canActivate: [AuthGuard], 
        loadChildren: () =>
            import("./../app/presentation/pages/pages.module").then((m) => m.PagesModule)
    },

    { path: "**", component: Page404Component },
];
