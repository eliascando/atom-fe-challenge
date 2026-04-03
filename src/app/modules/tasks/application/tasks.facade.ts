import { Injectable } from "@angular/core";
import {
    BehaviorSubject,
    catchError,
    finalize,
    Observable,
    tap,
    throwError
} from "rxjs";

import {
    CreateTaskInput,
    Task,
    UpdateTaskInput
} from "../domain/models/task.models";
import { TasksApiService } from "../infrastructure/tasks-api.service";

@Injectable({
    providedIn: "root"
})
export class TasksFacade {
    private readonly tasksSubject = new BehaviorSubject<Task[]>([]);
    private readonly loadingSubject = new BehaviorSubject<boolean>(false);
    private readonly savingSubject = new BehaviorSubject<boolean>(false);

    public readonly tasks$: Observable<Task[]> = this.tasksSubject.asObservable();
    public readonly loading$: Observable<boolean> = this.loadingSubject.asObservable();
    public readonly saving$: Observable<boolean> = this.savingSubject.asObservable();

    constructor(private readonly tasksApiService: TasksApiService) {}

    public loadTasks(): Observable<Task[]> {
        this.loadingSubject.next(true);

        return this.tasksApiService.getTasks().pipe(
            tap((tasks) => this.tasksSubject.next(TasksFacade.sortTasks(tasks))),
            finalize(() => this.loadingSubject.next(false)),
            catchError((error) => throwError(() => error))
        );
    }

    public createTask(payload: CreateTaskInput): Observable<Task> {
        this.savingSubject.next(true);

        return this.tasksApiService.createTask(payload).pipe(
            tap((task) => {
                this.tasksSubject.next(TasksFacade.sortTasks([...this.tasksSubject.value, task]));
            }),
            finalize(() => this.savingSubject.next(false)),
            catchError((error) => throwError(() => error))
        );
    }

    public updateTask(taskId: string, payload: UpdateTaskInput): Observable<Task> {
        this.savingSubject.next(true);

        return this.tasksApiService.updateTask(taskId, payload).pipe(
            tap((task) => {
                const nextTasks = this.tasksSubject.value.map((item) => (item.id === task.id ? task : item));
                this.tasksSubject.next(TasksFacade.sortTasks(nextTasks));
            }),
            finalize(() => this.savingSubject.next(false)),
            catchError((error) => throwError(() => error))
        );
    }

    public deleteTask(taskId: string): Observable<void> {
        this.savingSubject.next(true);

        return this.tasksApiService.deleteTask(taskId).pipe(
            tap(() => {
                this.tasksSubject.next(this.tasksSubject.value.filter((task) => task.id !== taskId));
            }),
            finalize(() => this.savingSubject.next(false)),
            catchError((error) => throwError(() => error))
        );
    }

    private static sortTasks(tasks: Task[]): Task[] {
        return [...tasks].sort(
            (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
        );
    }
}
