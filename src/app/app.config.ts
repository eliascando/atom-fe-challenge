import { provideHttpClient, withInterceptors } from "@angular/common/http";
import { ApplicationConfig } from "@angular/core";
import { provideAnimationsAsync } from "@angular/platform-browser/animations/async";
import { provideRouter, withInMemoryScrolling } from "@angular/router";

import { routes } from "./app.routes";
import { APP_SETTINGS } from "./core/config/app-settings.token";
import { authInterceptor } from "./core/interceptors/auth.interceptor";

export const appConfig: ApplicationConfig = {
    providers: [
        provideRouter(
            routes,
            withInMemoryScrolling({
                anchorScrolling: "enabled",
                scrollPositionRestoration: "enabled"
            })
        ),
        provideAnimationsAsync(),
        provideHttpClient(withInterceptors([authInterceptor])),
        {
            provide: APP_SETTINGS,
            useValue: {
                apiBaseUrl: "http://localhost:7071/api/v1"
            }
        }
    ]
};
