import { inject } from "@angular/core";
import {
    CanActivateFn,
    CanMatchFn,
    Router,
    UrlTree
} from "@angular/router";

import { SessionService } from "../services/session.service";

const allowPublicOnly = (): boolean | UrlTree => {
    const sessionService = inject(SessionService);
    const router = inject(Router);

    return sessionService.hasSession()
        ? router.createUrlTree(["/tasks"])
        : true;
};

export const publicOnlyGuard: CanActivateFn = () => allowPublicOnly();
export const publicOnlyMatchGuard: CanMatchFn = () => allowPublicOnly();
