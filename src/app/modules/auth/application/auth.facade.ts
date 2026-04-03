import { Injectable } from "@angular/core";
import { Observable, tap } from "rxjs";

import { SessionService } from "../../../core/services/session.service";
import {
    LoginInput,
    RegisterUserInput,
    UserSession
} from "../domain/models/auth.models";
import { AuthApiService } from "../infrastructure/auth-api.service";

@Injectable({
    providedIn: "root"
})
export class AuthFacade {
    constructor(
        private readonly authApiService: AuthApiService,
        private readonly sessionService: SessionService
    ) {}

    public checkUserExists(email: string): Observable<boolean> {
        return this.authApiService.checkUserExists(email);
    }

    public login(payload: LoginInput): Observable<UserSession> {
        return this.authApiService.login(payload).pipe(
            tap((session) => this.sessionService.startSession(session))
        );
    }

    public register(payload: RegisterUserInput): Observable<UserSession> {
        return this.authApiService.register(payload).pipe(
            tap((session) => this.sessionService.startSession(session))
        );
    }

    public logout(): void {
        this.sessionService.clearSession();
    }
}
