import { CommonModule } from "@angular/common";
import { Component, Inject } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from "@angular/material/dialog";

export interface ConfirmActionDialogData {
    title: string;
    description: string;
    confirmLabel?: string;
    cancelLabel?: string;
}

@Component({
    selector: "app-confirm-action-dialog",
    standalone: true,
    imports: [
        CommonModule,
        MatDialogModule,
        MatButtonModule
    ],
    templateUrl: "./confirm-action-dialog.component.html",
    styleUrl: "./confirm-action-dialog.component.scss"
})
export class ConfirmActionDialogComponent {
    constructor(
        private readonly dialogRef: MatDialogRef<ConfirmActionDialogComponent, boolean>,
        @Inject(MAT_DIALOG_DATA) public readonly data: ConfirmActionDialogData
    ) {}

    public close(confirmed: boolean): void {
        this.dialogRef.close(confirmed);
    }
}
