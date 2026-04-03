export type TaskStatus = "pending" | "in_progress" | "done";

export interface Task {
    id: string;
    title: string;
    description: string;
    status: TaskStatus;
    userId: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateTaskInput {
    title: string;
    description: string;
}

export interface UpdateTaskInput {
    title?: string;
    description?: string;
    status?: TaskStatus;
}
