import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { shareReplay } from 'rxjs/operators';
import { AppSocket } from 'src/app/app.module';
import { CrudService } from 'src/app/shared/services/crud.service';
import { CardFormComponent } from './components/card-form/card-form.component';
import { Sensor } from './dashboard.model';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  rowHeight: number;
  rowWidth: number;
  numCols: number;

  private _dashboard$: Observable<Sensor[]>

  constructor(
    private dialog: MatDialog,
    private crud: CrudService, 
    private appSocket: AppSocket
  ) { }

  getDashboard() {
    this.crud.read<Sensor[]>('sensor');
    if (!this._dashboard$) {
      this._dashboard$ = this.appSocket.fromEvent<Sensor[]>('sensor:response').pipe(shareReplay(1));
    }
    return this._dashboard$;
  }

  editCard(card: Sensor) {
    this.dialog.open(CardFormComponent, {
      data: {
        new: false,
        card: card
      }
    });
  }

  addCard(card: Sensor) {
    this.crud.create<Sensor>('sensor', card);
  }

  updateCard(card: Sensor) {
    this.crud.update<Sensor>('sensor', card);
  }

  deleteCard(card: Sensor) {
    this.crud.delete<Sensor>('sensor', card);
  }

  updateDashboard(cards: Sensor[]) {
    this.appSocket.emit('sensor:reorder', cards);
  }


}
