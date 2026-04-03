import { Routes } from "@angular/router";

import { authGuard } from "../../core/guards/auth.guard";

export const TASKS_ROUTES: Routes = [
    {
        path: "",
        title: "Mis Tareas",
        canActivate: [authGuard],
        loadComponent: () => import(
            "./presentation/pages/tasks-page/tasks-page.component"
        ).then((module) => module.TasksPageComponent)
    }
];
