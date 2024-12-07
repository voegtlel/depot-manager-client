import { Observable, of } from 'rxjs';
import { Injectable } from '@angular/core';
import { AuthUserModel, Item, Reservation, ItemWithComment, Picture, ItemState, Bay, UserModel } from '../_models';
import MOCK_DATA from './data-mock';

@Injectable({
    providedIn: 'root',
})
export class ApiMockService {
    authByCardId(cardToken: string): Observable<{ token: string; user: AuthUserModel }> {
        return of({
            token: '',
            user: MOCK_DATA.AuthUser
        })
    }

    getUser(userId: string): Observable<UserModel> {
        return of(MOCK_DATA.User)
    }

    getItems(): Observable<Item[]> {
        return of([MOCK_DATA.Item1, MOCK_DATA.Item2, MOCK_DATA.Item3]);
    }

    createItem(item: Item): Observable<Item> {
        // Add in global service
        return of(MOCK_DATA.Item1);
    }

    getItem(itemId: string): Observable<Item> {
        return of(MOCK_DATA.Item1);
    }

    saveItem(itemId: string, item: ItemWithComment): Observable<Item> {
        // Save item in global service
        return of(MOCK_DATA.Item2);
    }

    getBays(): Observable<Bay[]> {
        return of([MOCK_DATA.Bay1, MOCK_DATA.Bay2]);
    }

    createBay(bay: Bay): Observable<Bay> {
        return of(MOCK_DATA.Bay1);
    }

    getBay(bayId: string): Observable<Bay> {
        return of(MOCK_DATA.Bay1);
    }

    saveBay(bayId: string, bay: Bay): Observable<Bay> {
        return of(MOCK_DATA.Bay1);
    }

    getItemHistory(
        itemId: string,
        {
            start,
            end,
            offset,
            limit,
            limitBeforeStart,
            limitAfterEnd,
        }: {
            start?: string;
            end?: string;
            offset?: number;
            limit?: number;
            limitBeforeStart?: number;
            limitAfterEnd?: number;
        }
    ): Observable<ItemState[]> {
        return of([MOCK_DATA.ItemState])
    }

    getReservations({
                        start,
                        end,
                        offset,
                        limit,
                        limitBeforeStart,
                        limitAfterEnd,
                        itemId,
                    }: {
        start?: string;
        end?: string;
        offset?: number;
        limit?: number;
        limitBeforeStart?: number;
        limitAfterEnd?: number;
        itemId?: string;
    }): Observable<Reservation[]> {
        return of([MOCK_DATA.Reservation, MOCK_DATA.Reservation2])
    }

    getReservationItems(start: string, end: string, skipReservationId?: string): Observable<string[]> {
        return of([MOCK_DATA.Reservation.id])
    }

    createReservation(reservation: Reservation): Observable<Reservation> {
        // Create mock in api mock service
        return of(MOCK_DATA.Reservation)
    }

    getReservation(reservationId: string): Observable<Reservation> {
        return of(MOCK_DATA.Reservation)
    }

    saveReservation(reservationId: string, reservation: Reservation): Observable<Reservation> {
        return of(MOCK_DATA.Reservation);
    }

    deleteReservation(reservationId: string): Observable<Reservation> {
        return of(MOCK_DATA.Reservation);
    }

    getPictures(): Observable<Picture[]> {
        return of([]);
    }

    createPicture(data: Blob): Observable<string> {
        return of('');
    }

    getPictureUrl(pictureId: string): string {
        return '';
    }

    getPicturePreviewUrl(pictureId: string): string {
        return '';
    }
}
