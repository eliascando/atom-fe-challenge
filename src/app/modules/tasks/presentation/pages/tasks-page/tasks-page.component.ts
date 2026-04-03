import { AsyncPipe } from "@angular/common";
import {
    ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit
} from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatDialog, MatDialogModule } from "@angular/material/dialog";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { MatSnackBar, MatSnackBarModule } from "@angular/material/snack-bar";
import { MatToolbarModule } from "@angular/material/toolbar";
import { Router } from "@angular/router";
import {
    combineLatest,
    filter,
    switchMap
} from "rxjs";

import { SessionService } from "../../../../../core/services/session.service";
import { ApiErrorResponse } from "../../../../../shared/models/api-response.model";
import {
    ConfirmActionDialogComponent,
    ConfirmActionDialogData
} from "../../../../../shared/ui/confirm-action-dialog/confirm-action-dialog.component";
import { isUnauthorizedApiError } from "../../../../../shared/utils/api-error.utils";
import { AuthFacade } from "../../../../auth/application/auth.facade";
import { TasksFacade } from "../../../application/tasks.facade";
import { Task } from "../../../domain/models/task.models";
import { TaskCardComponent } from "../../components/task-card/task-card.component";
import {
    TaskDialogData,
    TaskDialogResult,
    TaskEditorDialogComponent
} from "../../dialogs/task-editor-dialog/task-editor-dialog.component";

@Component({
    selector: "app-tasks-page",
    standalone: true,
    imports: [
        AsyncPipe,
        MatToolbarModule,
        MatCardModule,
        MatDialogModule,
        MatButtonModule,
        MatProgressBarModule,
        MatSnackBarModule,
        TaskCardComponent
    ],
    templateUrl: "./tasks-page.component.html",
    styleUrl: "./tasks-page.component.scss",
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TasksPageComponent implements OnInit {
    protected liveMessage = "";

    protected readonly vm$ = combineLatest({
        session: this.sessionService.session$,
        tasks: this.tasksFacade.tasks$,
        loading: this.tasksFacade.loading$,
        saving: this.tasksFacade.saving$
    });

    private readonly destroyRef = inject(DestroyRef);

    constructor(
        private readonly tasksFacade: TasksFacade,
        private readonly sessionService: SessionService,
        private readonly authFacade: AuthFacade,
        private readonly dialog: MatDialog,
        private readonly snackBar: MatSnackBar,
        private readonly router: Router
    ) {}

    public ngOnInit(): void {
        this.announce("Cargando tareas.");

        this.tasksFacade.loadTasks().pipe(
            takeUntilDestroyed(this.destroyRef)
        ).subscribe({
            next: (tasks) => {
                this.announce(`Se cargaron ${tasks.length} tarea(s).`);
            },
            error: (error: ApiErrorResponse) => {
                this.handleRequestError(error);
            }
        });
    }

    public openCreateTaskDialog(): void {
        const data: TaskDialogData = {
            mode: "create"
        };

        this.dialog.open(TaskEditorDialogComponent, {
            width: "30rem",
            maxWidth: "calc(100vw - 2rem)",
            data
        }).afterClosed().pipe(
            filter((payload): payload is TaskDialogResult => Boolean(payload)),
            switchMap((payload) => {
                this.announce("Creando tarea.");
                return this.tasksFacade.createTask(payload);
            }),
            takeUntilDestroyed(this.destroyRef)
        ).subscribe({
            next: () => {
                this.announce("Tarea creada correctamente.");
                this.snackBar.open("Tarea creada correctamente.", "Cerrar", {
                    duration: 3000
                });
            },
            error: (error: ApiErrorResponse) => {
                this.handleRequestError(error);
            }
        });
    }

    public toggleTask(task: Task, completed: boolean): void {
        const nextStatus = completed ? "done" : "pending";

        if (task.status === nextStatus) {
            return;
        }

        this.announce(completed
            ? `Marcando ${task.title} como completada.`
            : `Marcando ${task.title} como pendiente.`);

        this.tasksFacade.updateTask(task.id, {
            status: nextStatus
        }).pipe(
            takeUntilDestroyed(this.destroyRef)
        ).subscribe({
            next: () => {
                this.announce(completed
                    ? `La tarea ${task.title} se marcó como completada.`
                    : `La tarea ${task.title} se marcó como pendiente.`);
            },
            error: (error: ApiErrorResponse) => {
                this.handleRequestError(error);
            }
        });
    }

    public editTask(task: Task): void {
        const data: TaskDialogData = {
            mode: "edit",
            task
        };

        this.dialog.open(TaskEditorDialogComponent, {
            width: "30rem",
            maxWidth: "calc(100vw - 2rem)",
            data
        }).afterClosed().pipe(
            filter((payload): payload is TaskDialogResult => Boolean(payload)),
            switchMap((payload) => this.tasksFacade.updateTask(task.id, payload)),
            takeUntilDestroyed(this.destroyRef)
        ).subscribe({
            next: () => {
                this.announce(`Tarea ${task.title} actualizada.`);
                this.snackBar.open("Tarea actualizada.", "Cerrar", {
                    duration: 3000
                });
            },
            error: (error: ApiErrorResponse) => {
                this.handleRequestError(error);
            }
        });
    }

    public deleteTask(task: Task): void {
        const data: ConfirmActionDialogData = {
            title: "Eliminar tarea",
            description: `Se eliminará "${task.title}". Esta acción no se puede deshacer.`,
            confirmLabel: "Eliminar"
        };

        this.announce(`Confirmación requerida para eliminar ${task.title}.`);

        this.dialog.open(ConfirmActionDialogComponent, {
            width: "28rem",
            maxWidth: "calc(100vw - 2rem)",
            data
        }).afterClosed().pipe(
            filter((confirmed): confirmed is true => confirmed === true),
            switchMap(() => this.tasksFacade.deleteTask(task.id)),
            takeUntilDestroyed(this.destroyRef)
        ).subscribe({
            next: () => {
                this.announce(`Tarea ${task.title} eliminada.`);
                this.snackBar.open("Tarea eliminada.", "Cerrar", {
                    duration: 3000
                });
            },
            error: (error: ApiErrorResponse) => {
                this.handleRequestError(error);
            }
        });
    }

    public logout(): void {
        this.announce("Sesión cerrada. Redirigiendo al acceso.");
        this.authFacade.logout();
        this.router.navigate(["/auth/login"], { replaceUrl: true });
    }

    private handleRequestError(error: ApiErrorResponse): void {
        if (isUnauthorizedApiError(error)) {
            this.announce("La sesión expiró. Redirigiendo al acceso.");
            this.snackBar.open("La sesión expiró. Volvé a iniciar sesión.", "Cerrar", {
                duration: 4000
            });
            return;
        }

        const message = error.error?.message ?? "Ocurrió un error al comunicarse con la API.";

        this.announce(message);
        this.snackBar.open(
            message,
            "Cerrar",
            { duration: 4000 }
        );
    }

    private announce(message: string): void {
        this.liveMessage = "";

        queueMicrotask(() => {
            this.liveMessage = message;
        });
    }
}
