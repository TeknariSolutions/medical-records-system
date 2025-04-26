import { RouterModule, Routes } from '@angular/router';
import { Page404Component } from './extrapages/page404/page404.component';
//import { CyptolandingComponent } from './cyptolanding/cyptolanding.component';
import { AuthGuard } from './core/guards/auth.guard';
import { LayoutComponent } from './layouts/layout.component';
import { LoginComponent } from './presentation/account/auth/login/login.component';
//import { LoginComponent } from './account/auth/login/login.component';

export const routes: Routes = [
    /* {
        path: "",
        redirectTo: "auth/login",
        pathMatch: "full"
    }, */
    { path: 'auth/login', component: LoginComponent},

  /*   {
        path: "auth",
        loadChildren: () =>
            import("./account/account.module").then((m) => m.AccountModule),
    }, */
    {
        path: "",
        component: LayoutComponent,
        loadChildren: () =>
            import("./../app/presentation/pages/pages.module").then((m) => m.PagesModule)
    },
  /*   {
        path: "parametrization",
        loadChildren: () =>
            import("./../app/presentation/pages/parametrization/parametrization.module").then((m) => m.ParametrizationModule),
        canActivate: [AuthGuard],
    }, */
    {
        path: "pages",
        loadChildren: () =>
            import("./extrapages/extrapages.module").then((m) => m.ExtrapagesModule),
        canActivate: [AuthGuard],
    },
   
    //{ path: "crypto-ico-landing", component: CyptolandingComponent },
    { path: "**", component: Page404Component },
];
