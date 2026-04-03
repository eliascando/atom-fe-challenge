import { HttpClient } from "@angular/common/http";
import { Inject, Injectable } from "@angular/core";
import { map, Observable } from "rxjs";

import { APP_SETTINGS, AppSettings } from "../../../core/config/app-settings.token";
import { ApiResponse } from "../../../shared/models/api-response.model";
import {
    CreateTaskInput,
    Task,
    UpdateTaskInput
} from "../domain/models/task.models";

@Injectable({
    providedIn: "root"
})
export class TasksApiService {
    constructor(
        private readonly httpClient: HttpClient,
        @Inject(APP_SETTINGS) private readonly settings: AppSettings
    ) {}

    public getTasks(): Observable<Task[]> {
        return this.httpClient
            .get<ApiResponse<Task[]>>(`${this.settings.apiBaseUrl}/tasks`)
            .pipe(map((response) => response.data));
    }

    public createTask(payload: CreateTaskInput): Observable<Task> {
        return this.httpClient
            .post<ApiResponse<Task>>(`${this.settings.apiBaseUrl}/tasks`, payload)
            .pipe(map((response) => response.data));
    }

    public updateTask(taskId: string, payload: UpdateTaskInput): Observable<Task> {
        return this.httpClient
            .put<ApiResponse<Task>>(`${this.settings.apiBaseUrl}/tasks/${taskId}`, payload)
            .pipe(map((response) => response.data));
    }

    public deleteTask(taskId: string): Observable<void> {
        return this.httpClient.delete<void>(`${this.settings.apiBaseUrl}/tasks/${taskId}`);
    }
}
