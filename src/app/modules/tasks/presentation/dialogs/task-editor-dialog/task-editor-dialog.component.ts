import { CommonModule } from "@angular/common";
import { Component, Inject } from "@angular/core";
import {
    FormBuilder,
    ReactiveFormsModule,
    Validators
} from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from "@angular/material/dialog";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";

import { AutofocusDirective } from "../../../../../shared/directives/autofocus.directive";
import { Task } from "../../../domain/models/task.models";

export interface TaskDialogData {
    mode: "create" | "edit";
    task?: Task;
}

export interface TaskDialogResult {
    title: string;
    description: string;
}

@Component({
    selector: "app-task-editor-dialog",
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        AutofocusDirective
    ],
    templateUrl: "./task-editor-dialog.component.html",
    styleUrl: "./task-editor-dialog.component.scss"
})
export class TaskEditorDialogComponent {
    protected readonly form = this.formBuilder.nonNullable.group({
        title: [this.data.task?.title ?? "", [Validators.required, Validators.minLength(3), Validators.maxLength(120)]],
        description: [this.data.task?.description ?? "", [Validators.maxLength(500)]]
    });

    constructor(
        private readonly formBuilder: FormBuilder,
        private readonly dialogRef: MatDialogRef<TaskEditorDialogComponent, TaskDialogResult | null>,
        @Inject(MAT_DIALOG_DATA) public readonly data: TaskDialogData
    ) {}

    public get dialogTitle(): string {
        return this.data.mode === "create" ? "Nueva tarea" : "Editar tarea";
    }

    public get submitLabel(): string {
        return this.data.mode === "create" ? "Guardar" : "Guardar cambios";
    }

    public submit(): void {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        const { title, description } = this.form.getRawValue();

        this.dialogRef.close({
            title: title.trim(),
            description: description.trim()
        });
    }
}
