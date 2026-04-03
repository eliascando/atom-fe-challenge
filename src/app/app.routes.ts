import { Routes } from "@angular/router";

import { authMatchGuard } from "./core/guards/auth.guard";
import { publicOnlyMatchGuard } from "./core/guards/public-only.guard";

export const routes: Routes = [
    {
        path: "",
        redirectTo: "/tasks",
        pathMatch: "full"
    },
    {
        path: "auth",
        canMatch: [publicOnlyMatchGuard],
        loadChildren: () => import("./modules/auth/auth.routes").then((module) => module.AUTH_ROUTES)
    },
    {
        path: "tasks",
        canMatch: [authMatchGuard],
        loadChildren: () => import("./modules/tasks/tasks.routes").then((module) => module.TASKS_ROUTES)
    },
    {
        path: "**",
        redirectTo: "/tasks"
    }
];
