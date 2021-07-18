import { Pipe, PipeTransform } from '@angular/core';
import { UsersService } from '../_services';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Pipe({
    name: 'userName',
})
export class UserNamePipe implements PipeTransform {
    constructor(private usersService: UsersService) {}

    transform(value: string): Observable<string> {
        if (!value) {
            return null;
        }
        return this.usersService.getUser(value).pipe(map((user) => user.name));
    }
}
