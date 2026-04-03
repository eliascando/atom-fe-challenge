import { Routes } from "@angular/router";

import { publicOnlyGuard } from "../../core/guards/public-only.guard";

export const AUTH_ROUTES: Routes = [
    {
        path: "",
        redirectTo: "login",
        pathMatch: "full"
    },
    {
        path: "login",
        title: "Iniciar sesión | Mis Tareas",
        canActivate: [publicOnlyGuard],
        loadComponent: () => import(
            "./presentation/pages/login-page/login-page.component"
        ).then((module) => module.LoginPageComponent)
    },
    {
        path: "register",
        title: "Crear cuenta | Mis Tareas",
        canActivate: [publicOnlyGuard],
        loadComponent: () => import(
            "./presentation/pages/register-page/register-page.component"
        ).then((module) => module.RegisterPageComponent)
    }
];
