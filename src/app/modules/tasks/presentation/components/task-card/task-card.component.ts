import { CommonModule, DatePipe } from "@angular/common";
import {
    ChangeDetectionStrategy, Component, EventEmitter, HostBinding, Input, Output
} from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatCheckboxChange, MatCheckboxModule } from "@angular/material/checkbox";

import { Task } from "../../../domain/models/task.models";

@Component({
    selector: "app-task-card",
    standalone: true,
    imports: [
        CommonModule,
        DatePipe,
        MatCardModule,
        MatCheckboxModule,
        MatButtonModule
    ],
    templateUrl: "./task-card.component.html",
    styleUrl: "./task-card.component.scss",
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaskCardComponent {
    @HostBinding("attr.role") public readonly role = "listitem";
    @Input({ required: true }) public task!: Task;

    @Output() public readonly statusChanged = new EventEmitter<boolean>();
    @Output() public readonly editRequested = new EventEmitter<void>();
    @Output() public readonly deleteRequested = new EventEmitter<void>();

    public onStatusChange(event: MatCheckboxChange): void {
        this.statusChanged.emit(event.checked);
    }

    public isCompleted(): boolean {
        return this.task.status === "done";
    }

    public getStatusLabel(): string {
        switch (this.task.status) {
            case "done":
                return "Completada";
            case "in_progress":
                return "En progreso";
            default:
                return "Pendiente";
        }
    }
}
