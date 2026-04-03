export interface AuthNavigationState {
    email?: string;
    password?: string;
    context?: "manual-register" | "missing-user";
}
