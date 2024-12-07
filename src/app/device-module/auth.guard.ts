import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { tap } from 'rxjs/operators';
import { DeviceCodeService } from './_services/device-code.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard  {
    constructor(private router: Router, private codeService: DeviceCodeService) {}

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        return this.codeService.loggedIn$.pipe(
            tap((loggedIn) => {
                if (!loggedIn) {
                    this.router.navigate(['/']);
                }
            })
        );
    }
}
