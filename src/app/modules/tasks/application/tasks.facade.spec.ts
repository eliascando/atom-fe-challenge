import { of } from "rxjs";

import { Task } from "../domain/models/task.models";
import { TasksApiService } from "../infrastructure/tasks-api.service";
import { TasksFacade } from "./tasks.facade";

describe("TasksFacade", () => {
    let tasksApiServiceSpy: jasmine.SpyObj<TasksApiService>;
    let facade: TasksFacade;

    beforeEach(() => {
        tasksApiServiceSpy = jasmine.createSpyObj<TasksApiService>(
            "TasksApiService",
            ["getTasks", "createTask", "updateTask", "deleteTask"]
        );
        facade = new TasksFacade(tasksApiServiceSpy);
    });

    it("should keep tasks sorted by creation date descending", (done) => {
        const olderTask: Task = {
            id: "task-1",
            title: "Primera",
            description: "",
            status: "pending",
            userId: "user-1",
            createdAt: "2026-03-30T10:00:00.000Z",
            updatedAt: "2026-03-30T10:00:00.000Z"
        };
        const newerTask: Task = {
            id: "task-2",
            title: "Segunda",
            description: "",
            status: "done",
            userId: "user-1",
            createdAt: "2026-04-01T10:00:00.000Z",
            updatedAt: "2026-04-01T10:00:00.000Z"
        };

        tasksApiServiceSpy.getTasks.and.returnValue(of([olderTask, newerTask]));

        facade.loadTasks().subscribe({
            next: () => {
                facade.tasks$.subscribe((tasks) => {
                    expect(tasks[0]).toEqual(newerTask);
                    expect(tasks[1]).toEqual(olderTask);
                    done();
                });
            }
        });
    });

    it("should replace the updated task in state", (done) => {
        const task: Task = {
            id: "task-1",
            title: "Primera",
            description: "",
            status: "pending",
            userId: "user-1",
            createdAt: "2026-03-30T10:00:00.000Z",
            updatedAt: "2026-03-30T10:00:00.000Z"
        };
        const updatedTask: Task = {
            ...task,
            status: "done",
            updatedAt: "2026-04-01T12:00:00.000Z"
        };

        tasksApiServiceSpy.getTasks.and.returnValue(of([task]));
        tasksApiServiceSpy.updateTask.and.returnValue(of(updatedTask));

        facade.loadTasks().subscribe({
            next: () => {
                facade.updateTask(task.id, { status: "done" }).subscribe({
                    next: () => {
                        facade.tasks$.subscribe((tasks) => {
                            expect(tasks[0].status).toBe("done");
                            done();
                        });
                    }
                });
            }
        });
    });
});
