import { APP_BASE_HREF } from '@angular/common';
import { HttpClient, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { NbSidebarModule, NbSidebarService, NbThemeModule, NbToastrService } from '@nebular/theme';
import { OAuthService } from 'angular-oauth2-oidc';

import { environment } from 'src/environments/environment';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './client-module/app.routing.module';
import { ClientModuleModule } from './client-module/client-module.module';
import { ApiService, AuthService, EnvService } from './common-module/_services';
import { ApiMockService } from './common-module/_services/api-mock.service';
import { AuthMockService } from './common-module/_services/auth-mock.service';
import { ReservationResolver } from './device-module/_services/reservation.resolver';
import { DeviceAppRoutingModule } from './device-module/app.routing.device.module';
import { DeviceModuleModule } from './device-module/device-module.module';

@NgModule({
    // entryComponents: [CalendarRangeDayCellComponent, CalendarRangeComponent],
    declarations: [AppComponent],
    bootstrap: [AppComponent],
    imports: [BrowserModule,
        BrowserAnimationsModule,
        NbThemeModule.forRoot(),
        environment.onDevice ? DeviceModuleModule : ClientModuleModule,
        environment.onDevice ? DeviceAppRoutingModule : AppRoutingModule,
        NbSidebarModule],
    providers: [
        NbSidebarService,
        {
            provide: APP_BASE_HREF,
            useValue: '/'
        },
        ReservationResolver,
        provideHttpClient(withInterceptorsFromDi()),
        {
            provide: AuthService,
            useFactory: (oAuth: OAuthService, envService: EnvService, router: Router, toastService: NbToastrService) => {
                if (environment.offline) {
                    return new AuthMockService(router);
                } else {
                    return new AuthService(oAuth, envService, router, toastService);
                }
            },
            deps: [OAuthService, EnvService, Router, NbToastrService]
        },
        {
            provide: ApiService,
            useFactory: (httpClient: HttpClient, envService: EnvService, authService: AuthService) => {
                if (environment.offline) {
                    return new ApiMockService(authService);
                } else {
                    return new ApiService(httpClient, envService, authService);
                }
            },
            deps: [HttpClient, EnvService, OAuthService]
        },
    ]
})
export class AppModule {
}
