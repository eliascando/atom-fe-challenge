import {
    HttpClient,
    HttpErrorResponse,
    provideHttpClient,
    withInterceptors
} from "@angular/common/http";
import {
    HttpTestingController,
    provideHttpClientTesting
} from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { Router } from "@angular/router";

import { UserSession } from "../../modules/auth/domain/models/auth.models";
import { SessionService } from "../services/session.service";
import { authInterceptor } from "./auth.interceptor";

const API_URL = "/api/tasks";

function createSession(): UserSession {
    return {
        token: "token-123",
        user: {
            id: "user-1",
            name: "Elias",
            email: "elias@example.com",
            createdAt: "2026-04-01T00:00:00.000Z"
        }
    };
}

describe("authInterceptor", () => {
    let httpClient: HttpClient;
    let httpTestingController: HttpTestingController;
    let router: Router;
    let sessionService: SessionService;

    beforeEach(() => {
        localStorage.clear();
        const routerSpy = jasmine.createSpyObj<Router>("Router", ["navigate"]);
        routerSpy.navigate.and.resolveTo(true);

        TestBed.configureTestingModule({
            providers: [
                {
                    provide: Router,
                    useValue: routerSpy
                },
                provideHttpClient(withInterceptors([authInterceptor])),
                provideHttpClientTesting()
            ]
        });

        httpClient = TestBed.inject(HttpClient);
        httpTestingController = TestBed.inject(HttpTestingController);
        router = TestBed.inject(Router);
        sessionService = TestBed.inject(SessionService);
    });

    afterEach(() => {
        httpTestingController.verify();
        localStorage.clear();
    });

    it("should add the bearer token to authenticated requests", () => {
        sessionService.startSession(createSession());

        httpClient.get(API_URL).subscribe();

        const request = httpTestingController.expectOne(API_URL);

        expect(request.request.headers.get("Authorization")).toBe("Bearer token-123");

        request.flush({ data: [] });
    });

    it("should clear the session and redirect to login when the api returns 401", () => {
        sessionService.startSession(createSession());
        let capturedError: HttpErrorResponse | undefined;

        httpClient.get(API_URL).subscribe({
            error: (error: HttpErrorResponse) => {
                capturedError = error;
            }
        });

        const request = httpTestingController.expectOne(API_URL);
        request.flush(
            {
                error: {
                    code: "UNAUTHORIZED"
                }
            },
            {
                status: 401,
                statusText: "Unauthorized"
            }
        );

        expect(capturedError).toBeTruthy();
        expect(sessionService.currentSession).toBeNull();
        expect(router.navigate).toHaveBeenCalledWith(["/auth/login"], { replaceUrl: true });
    });
});
