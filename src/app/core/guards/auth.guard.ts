import { inject } from "@angular/core";
import {
    CanActivateFn,
    CanMatchFn,
    Router,
    UrlTree
} from "@angular/router";

import { SessionService } from "../services/session.service";

const requireSession = (): boolean | UrlTree => {
    const sessionService = inject(SessionService);
    const router = inject(Router);

    return sessionService.hasSession()
        ? true
        : router.createUrlTree(["/auth/login"]);
};

export const authGuard: CanActivateFn = () => requireSession();
export const authMatchGuard: CanMatchFn = () => requireSession();
