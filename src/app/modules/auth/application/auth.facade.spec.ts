import { of } from "rxjs";

import { SessionService } from "../../../core/services/session.service";
import { AuthApiService } from "../infrastructure/auth-api.service";
import { AuthFacade } from "./auth.facade";

describe("AuthFacade", () => {
    let authApiServiceSpy: jasmine.SpyObj<AuthApiService>;
    let sessionServiceSpy: jasmine.SpyObj<SessionService>;
    let facade: AuthFacade;

    beforeEach(() => {
        authApiServiceSpy = jasmine.createSpyObj<AuthApiService>(
            "AuthApiService",
            ["checkUserExists", "login", "register"]
        );
        sessionServiceSpy = jasmine.createSpyObj<SessionService>("SessionService", ["startSession", "clearSession"]);
        facade = new AuthFacade(authApiServiceSpy, sessionServiceSpy);
    });

    it("should persist the session after login", (done) => {
        const session = {
            token: "token-123",
            user: {
                id: "user-1",
                name: "Elias",
                email: "elias@example.com",
                createdAt: "2026-04-01T00:00:00.000Z"
            }
        };

        authApiServiceSpy.login.and.returnValue(of(session));

        facade.login({ email: session.user.email, password: "password123" }).subscribe({
            next: (result) => {
                expect(result).toEqual(session);
                expect(sessionServiceSpy.startSession).toHaveBeenCalledWith(session);
                done();
            }
        });
    });

    it("should clear the session on logout", () => {
        facade.logout();

        expect(sessionServiceSpy.clearSession).toHaveBeenCalled();
    });
});
