import { CommonModule } from "@angular/common";
import {
    ChangeDetectionStrategy, Component, DestroyRef, inject
} from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import {
    FormBuilder,
    ReactiveFormsModule,
    Validators
} from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { MatSnackBar, MatSnackBarModule } from "@angular/material/snack-bar";
import { Router } from "@angular/router";
import { finalize } from "rxjs";

import { AutofocusDirective } from "../../../../../shared/directives/autofocus.directive";
import { ApiErrorResponse } from "../../../../../shared/models/api-response.model";
import { AuthFacade } from "../../../application/auth.facade";
import { AuthNavigationState } from "../../models/auth-navigation-state.model";

@Component({
    selector: "app-register-page",
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatProgressBarModule,
        MatSnackBarModule,
        AutofocusDirective
    ],
    templateUrl: "./register-page.component.html",
    styleUrl: "./register-page.component.scss",
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class RegisterPageComponent {
    protected readonly form = this.formBuilder.nonNullable.group({
        name: ["", [Validators.required, Validators.minLength(2), Validators.maxLength(80)]],
        email: ["", [Validators.required, Validators.email]],
        password: ["", [Validators.required, Validators.minLength(8), Validators.maxLength(72)]]
    });

    protected isSubmitting = false;
    protected liveMessage = "";

    private readonly destroyRef = inject(DestroyRef);
    private readonly navigationState: AuthNavigationState;

    constructor(
        private readonly formBuilder: FormBuilder,
        private readonly authFacade: AuthFacade,
        private readonly snackBar: MatSnackBar,
        private readonly router: Router
    ) {
        this.navigationState = this.readNavigationState();

        this.form.patchValue({
            email: this.navigationState.email ?? "",
            password: this.navigationState.password ?? ""
        });
    }

    public get description(): string {
        if (this.navigationState.context === "missing-user" && this.navigationState.email) {
            return `No se encontró una cuenta para ${this.navigationState.email}. Completa el registro para continuar.`;
        }

        return "Completa los datos para crear una cuenta.";
    }

    public submit(): void {
        if (this.form.invalid || this.isSubmitting) {
            this.form.markAllAsTouched();
            return;
        }

        const payload = this.form.getRawValue();

        this.isSubmitting = true;
        this.announce("Creando cuenta.");

        this.authFacade.register({
            name: payload.name.trim(),
            email: payload.email.trim().toLowerCase(),
            password: payload.password
        }).pipe(
            finalize(() => {
                this.isSubmitting = false;
            }),
            takeUntilDestroyed(this.destroyRef)
        ).subscribe({
            next: () => {
                this.announce("Cuenta creada correctamente. Redirigiendo a Mis Tareas.");
                this.router.navigate(["/tasks"], { replaceUrl: true });
            },
            error: (error: ApiErrorResponse) => {
                const message = RegisterPageComponent.resolveErrorMessage(error);

                this.announce(message);
                this.snackBar.open(message, "Cerrar", {
                    duration: 4000
                });
            }
        });
    }

    public goToLogin(): void {
        this.router.navigate(["/auth/login"], {
            state: {
                email: this.form.controls.email.value.trim().toLowerCase(),
                password: this.form.controls.password.value
            } satisfies AuthNavigationState
        });
    }

    private static resolveErrorMessage(error: ApiErrorResponse): string {
        return error.error?.message ?? "No fue posible completar la operación. Inténtalo de nuevo.";
    }

    private readNavigationState(): AuthNavigationState {
        const state = (this.router.getCurrentNavigation()?.extras.state ?? globalThis.history.state) as
            | AuthNavigationState
            | undefined;

        return {
            email: typeof state?.email === "string" ? state.email : "",
            password: typeof state?.password === "string" ? state.password : "",
            context: state?.context === "missing-user" ? "missing-user" : "manual-register"
        };
    }

    private announce(message: string): void {
        this.liveMessage = "";

        queueMicrotask(() => {
            this.liveMessage = message;
        });
    }
}
