import { HttpErrorResponse } from "@angular/common/http";

import { ApiErrorResponse } from "../models/api-response.model";

export const isUnauthorizedApiError = (error: unknown): boolean => {
    if (error instanceof HttpErrorResponse) {
        return error.status === 401 || error.error?.code === "UNAUTHORIZED";
    }

    const apiError = error as ApiErrorResponse | undefined;

    return apiError?.error?.code === "UNAUTHORIZED";
};
