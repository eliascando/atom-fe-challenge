import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";

import { UserSession } from "../../modules/auth/domain/models/auth.models";

const SESSION_STORAGE_KEY = "mis-tareas.session";

@Injectable({
    providedIn: "root"
})
export class SessionService {
    private readonly sessionSubject = new BehaviorSubject<UserSession | null>(SessionService.readStoredSession());

    public readonly session$: Observable<UserSession | null> = this.sessionSubject.asObservable();

    public get currentSession(): UserSession | null {
        return this.sessionSubject.value;
    }

    public hasSession(): boolean {
        return this.currentSession !== null;
    }

    public getToken(): string | null {
        return this.currentSession?.token ?? null;
    }

    public startSession(session: UserSession): void {
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
        this.sessionSubject.next(session);
    }

    public clearSession(): void {
        localStorage.removeItem(SESSION_STORAGE_KEY);
        this.sessionSubject.next(null);
    }

    private static readStoredSession(): UserSession | null {
        const sessionRaw = localStorage.getItem(SESSION_STORAGE_KEY);

        if (!sessionRaw) {
            return null;
        }

        try {
            return JSON.parse(sessionRaw) as UserSession;
        } catch {
            localStorage.removeItem(SESSION_STORAGE_KEY);
            return null;
        }
    }
}
