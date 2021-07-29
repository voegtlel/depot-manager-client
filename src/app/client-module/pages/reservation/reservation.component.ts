import { Component, OnDestroy, OnInit } from '@angular/core';
import { ApiService, AuthService, UsersService } from '../../../common-module/_services';
import { BehaviorSubject, Observable, of, Subject, combineLatest } from 'rxjs';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Reservation, ReservationType, UserModel } from '../../../common-module/_models';
import { ActivatedRoute, Router } from '@angular/router';
import { NbToastrService } from '@nebular/theme';
import { filter, map, shareReplay, startWith, switchMap, takeUntil, tap } from 'rxjs/operators';

@Component({
    selector: 'depot-reservation',
    templateUrl: './reservation.component.html',
})
export class ReservationComponent implements OnInit, OnDestroy {
    private destroyed$ = new Subject<void>();

    loading: boolean;
    submitted: boolean;

    isNew: boolean;

    reload$: BehaviorSubject<void> = new BehaviorSubject(undefined);

    teams$: Observable<{ value: string; title: string }[]>;

    reservationId: string = null;

    readonly form: FormGroup = new FormGroup({
        name: new FormControl('', Validators.required),
        type: new FormControl(null, Validators.required),
        start: new FormControl(null, Validators.required),
        end: new FormControl(null, Validators.required),
        userId: new FormControl(null),
        teamId: new FormControl({ value: null, disabled: true }),
        contact: new FormControl('', Validators.required),
        items: new FormControl([]),
    });
    readonly userName = new FormControl({ value: '', disabled: true });
    userIdRaw$ = new BehaviorSubject<string>(null);

    reservationChoices = [
        { value: ReservationType.Private, title: 'Private' },
        { value: ReservationType.Team, title: 'Team' },
    ];
    allUsers$: Observable<{ value: string; title: string }[] | undefined>;

    canReturn$: Observable<boolean>;

    constructor(
        public api: ApiService,
        public authService: AuthService,
        public activatedRoute: ActivatedRoute,
        private userService: UsersService,
        public router: Router,
        private toastrService: NbToastrService
    ) {}

    ngOnInit() {
        const reservationId$ = this.activatedRoute.paramMap.pipe(map((params) => params.get('reservationId')));
        const loadedReservation$: Observable<Reservation> = this.reload$.pipe(
            switchMap(() => reservationId$),
            switchMap((reservationId) => {
                if (reservationId && reservationId !== 'new') {
                    return this.api.getReservation(reservationId);
                }
                return of(null);
            }),
            shareReplay(1),
            takeUntil(this.destroyed$)
        );

        /*this.teams$ = this.authService.user$.pipe(
            map((user) => user.teams?.map((team) => ({ value: team, title: team })) ?? [])
        );*/

        this.teams$ = this.authService.user$.pipe(
            switchMap((user) =>
                user.roles.includes('admin')
                    ? this.form.controls.userId.valueChanges.pipe(
                          startWith(this.form.controls.userId.value),
                          switchMap((userId) => this.userService.getUser(userId)),
                          tap((user) => console.log('Fetched selected user:', user)),
                          map(
                              (selectedUser) => selectedUser?.teams?.map((team) => ({ value: team, title: team })) ?? []
                          )
                      )
                    : of(user.teams?.map((team) => ({ value: team, title: team })) ?? [])
            ),
            shareReplay(1)
        );

        this.allUsers$ = this.authService.user$.pipe(
            switchMap((user) => (user.roles.includes('admin') ? this.userService.allUsers() : of([user]))),
            map((users) => users.map((user) => ({ value: user.sub, title: `${user.name}` })) ?? [])
        );

        combineLatest([loadedReservation$, this.authService.user$])
            .pipe(takeUntil(this.destroyed$))
            .subscribe(([reservation, user]) => {
                if (reservation !== null) {
                    this.reservationId = reservation.id;
                    this.isNew = false;
                    this.userName.reset(reservation.userId);
                    this.userIdRaw$.next(reservation.userId);
                    this.form.reset(reservation);

                    if (
                        reservation.userId === user.sub ||
                        user.teams?.includes(reservation.teamId) ||
                        user.roles.includes('admin')
                    ) {
                        this.form.enable();
                    } else {
                        this.form.disable();
                    }
                } else {
                    this.reservationId = null;
                    this.isNew = true;
                    this.userName.reset(user.sub);
                    this.userIdRaw$.next(user.sub);
                    this.form.reset({
                        id: null,
                        type: null,
                        name: '',
                        start: null,
                        end: null,
                        userId: user.sub,

                        teamId: null,
                        contact: `${user.name} (${user.email}, ${user.phone_number})`,

                        items: [],
                    });
                }
                this.onTypeChange(this.form.controls.type.value);
                this.submitted = false;
                this.loading = false;
            });
        this.canReturn$ = this.form.controls.start.valueChanges.pipe(
            startWith(this.form.controls.start.value),
            map((value) => value && value >= new Date().toISOString().substring(0, 10)),
            takeUntil(this.destroyed$)
        );

        this.userIdRaw$
            .pipe(
                switchMap((userId) => (userId ? this.userService.getUser(userId) : of({ name: userId }))),
                takeUntil(this.destroyed$)
            )
            .subscribe((user) => {
                if (user) {
                    this.userName.reset(user.name);
                }
            });
    }

    ngOnDestroy(): void {
        this.destroyed$.next();
    }

    onTypeChange($event) {
        if ($event === ReservationType.Team) {
            this.form.controls.teamId.enable();
        } else {
            this.form.controls.teamId.setValue(null);
            this.form.controls.teamId.disable();
        }
    }

    onSubmit() {
        this.submitted = true;
        if (!this.form.valid) {
            return;
        }
        let apiCall: Observable<Reservation>;
        const formValue = this.form.getRawValue();
        if (formValue.userId == null) {
            formValue.userId = this.userIdRaw$.value;
        }
        console.log('Submit:', formValue);
        if (this.isNew) {
            apiCall = this.api.createReservation(formValue);
        } else {
            apiCall = this.api.saveReservation(this.reservationId, formValue);
        }
        apiCall.subscribe(
            (reservation) => {
                console.log('Saved', reservation);
                this.form.reset(reservation);
                this.form.markAsPristine();
                this.form.markAsUntouched();
                this.router.navigate(['..', reservation.id], {
                    replaceUrl: true,
                    relativeTo: this.activatedRoute,
                });
                this.toastrService.success('Reservation was saved', 'Reservation Saved');
            },
            (error) => {
                console.log(error);
                this.toastrService.danger(error, 'Failed');
            }
        );
    }
}
