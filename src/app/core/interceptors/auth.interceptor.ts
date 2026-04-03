import { HttpInterceptorFn } from "@angular/common/http";
import { inject } from "@angular/core";
import { Router } from "@angular/router";
import { catchError, throwError } from "rxjs";

import { isUnauthorizedApiError } from "../../shared/utils/api-error.utils";
import { SessionService } from "../services/session.service";

export const authInterceptor: HttpInterceptorFn = (request, next) => {
    const sessionService = inject(SessionService);
    const router = inject(Router);
    const token = sessionService.getToken();

    if (!token) {
        return next(request);
    }

    return next(request.clone({
        setHeaders: {
            Authorization: `Bearer ${token}`
        }
    })).pipe(
        catchError((error: unknown) => {
            if (isUnauthorizedApiError(error)) {
                sessionService.clearSession();
                router.navigate(["/auth/login"], { replaceUrl: true }).catch(() => false);
            }

            return throwError(() => error);
        })
    );
};
