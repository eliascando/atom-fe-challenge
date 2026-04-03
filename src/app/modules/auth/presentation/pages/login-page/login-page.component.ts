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
import {
    EMPTY,
    finalize,
    switchMap
} from "rxjs";

import { AutofocusDirective } from "../../../../../shared/directives/autofocus.directive";
import { ApiErrorResponse } from "../../../../../shared/models/api-response.model";
import { AuthFacade } from "../../../application/auth.facade";
import { AuthNavigationState } from "../../models/auth-navigation-state.model";

@Component({
    selector: "app-login-page",
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
    templateUrl: "./login-page.component.html",
    styleUrl: "./login-page.component.scss",
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginPageComponent {
    protected readonly form = this.formBuilder.nonNullable.group({
        email: ["", [Validators.required, Validators.email]],
        password: ["", [Validators.required, Validators.minLength(8), Validators.maxLength(72)]]
    });

    protected isSubmitting = false;
    protected liveMessage = "";

    private readonly destroyRef = inject(DestroyRef);

    constructor(
        private readonly formBuilder: FormBuilder,
        private readonly authFacade: AuthFacade,
        private readonly snackBar: MatSnackBar,
        private readonly router: Router
    ) {
        const navigationState = this.readNavigationState();

        this.form.patchValue({
            email: navigationState.email ?? "",
            password: navigationState.password ?? ""
        });
    }

    public submit(): void {
        if (this.form.invalid || this.isSubmitting) {
            this.form.markAllAsTouched();
            return;
        }

        const credentials = {
            email: this.form.controls.email.value.trim().toLowerCase(),
            password: this.form.controls.password.value
        };

        this.isSubmitting = true;
        this.announce("Verificando credenciales.");

        this.authFacade.checkUserExists(credentials.email).pipe(
            switchMap((exists) => {
                if (exists) {
                    return this.authFacade.login(credentials);
                }

                this.announce("No se encontró una cuenta. Redirigiendo al registro.");
                this.navigateToRegister({
                    ...credentials,
                    context: "missing-user"
                });

                return EMPTY;
            }),
            finalize(() => {
                this.isSubmitting = false;
            }),
            takeUntilDestroyed(this.destroyRef)
        ).subscribe({
            next: () => {
                this.announce("Inicio de sesión correcto. Redirigiendo a Mis Tareas.");
                this.router.navigate(["/tasks"], { replaceUrl: true });
            },
            error: (error: ApiErrorResponse) => {
                const message = LoginPageComponent.resolveErrorMessage(error);

                this.announce(message);
                this.snackBar.open(message, "Cerrar", {
                    duration: 4000
                });
            }
        });
    }

    public goToRegister(): void {
        if (this.isSubmitting) {
            return;
        }

        this.announce("Abriendo registro.");
        this.navigateToRegister({
            email: this.form.controls.email.value.trim(),
            password: this.form.controls.password.value,
            context: "manual-register"
        });
    }

    private static resolveErrorMessage(error: ApiErrorResponse): string {
        return error.error?.message ?? "No fue posible completar la operación. Inténtalo de nuevo.";
    }

    private navigateToRegister(state: AuthNavigationState): void {
        this.router.navigate(["/auth/register"], {
            state
        });
    }

    private readNavigationState(): AuthNavigationState {
        const state = (this.router.getCurrentNavigation()?.extras.state ?? globalThis.history.state) as
            | AuthNavigationState
            | undefined;

        return {
            email: typeof state?.email === "string" ? state.email : "",
            password: typeof state?.password === "string" ? state.password : ""
        };
    }

    private announce(message: string): void {
        this.liveMessage = "";

        queueMicrotask(() => {
            this.liveMessage = message;
        });
    }
}
