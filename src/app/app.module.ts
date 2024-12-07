import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { APP_BASE_HREF } from '@angular/common';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './client-module/app.routing.module';
import { DeviceAppRoutingModule } from './device-module/app.routing.device.module';

import { environment } from 'src/environments/environment';
import { ClientModuleModule } from './client-module/client-module.module';
import { DeviceModuleModule } from './device-module/device-module.module';
import { NbSidebarModule, NbSidebarService, NbThemeModule, NbToastrService } from '@nebular/theme';
import { ReservationResolver } from './device-module/_services/reservation.resolver';
import { AuthMockService } from './common-module/_services/auth-mock.service';
import { ApiService, AuthService, EnvService } from './common-module/_services';
import { ApiMockService } from './common-module/_services/api-mock.service';
import { OAuthService } from 'angular-oauth2-oidc';
import { Router } from '@angular/router';

@NgModule({
    // entryComponents: [CalendarRangeDayCellComponent, CalendarRangeComponent],
    declarations: [AppComponent],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        NbThemeModule.forRoot(),
        environment.onDevice ? DeviceModuleModule : ClientModuleModule,
        HttpClientModule,
        environment.onDevice ? DeviceAppRoutingModule : AppRoutingModule,
        NbSidebarModule,
    ],
    providers: [NbSidebarService, { provide: APP_BASE_HREF, useValue: '/' }, ReservationResolver,
        {
            provide: AuthService,
            useFactory: (oAuth: OAuthService, envService: EnvService,router: Router, toastService: NbToastrService) => {
                if (environment.offline) {
                    return new AuthMockService(router);
                } else {
                    return new AuthService(oAuth, envService,router, toastService);
                }
            },
            deps: [OAuthService, EnvService, Router, NbToastrService]
            },
        {
            provide: ApiService,
            useFactory: (httpClient: HttpClient, envService: EnvService,oAuth: OAuthService) => {
                if (environment.offline) {
                    return new ApiMockService();
                } else {
                    return new ApiService( httpClient,envService, oAuth);
                }
            },
            deps: [HttpClient, EnvService, OAuthService]
        },
        ],

    bootstrap: [AppComponent],
})
export class AppModule {}
