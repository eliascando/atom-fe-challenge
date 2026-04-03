import { HttpClient, HttpParams } from "@angular/common/http";
import { Inject, Injectable } from "@angular/core";
import { map, Observable } from "rxjs";

import { APP_SETTINGS, AppSettings } from "../../../core/config/app-settings.token";
import { ApiResponse } from "../../../shared/models/api-response.model";
import {
    LoginInput,
    RegisterUserInput,
    UserSession
} from "../domain/models/auth.models";

@Injectable({
    providedIn: "root"
})
export class AuthApiService {
    constructor(
        private readonly httpClient: HttpClient,
        @Inject(APP_SETTINGS) private readonly settings: AppSettings
    ) {}

    public checkUserExists(email: string): Observable<boolean> {
        const params = new HttpParams().set("email", email.trim().toLowerCase());

        return this.httpClient
            .get<ApiResponse<{ exists: boolean }>>(`${this.settings.apiBaseUrl}/users/exists`, { params })
            .pipe(map((response) => response.data.exists));
    }

    public login(payload: LoginInput): Observable<UserSession> {
        return this.httpClient
            .post<ApiResponse<UserSession>>(`${this.settings.apiBaseUrl}/auth/login`, payload)
            .pipe(map((response) => response.data));
    }

    public register(payload: RegisterUserInput): Observable<UserSession> {
        return this.httpClient
            .post<ApiResponse<UserSession>>(`${this.settings.apiBaseUrl}/users`, payload)
            .pipe(map((response) => response.data));
    }
}
