import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { shareReplay } from 'rxjs/operators';
import { AppSocket } from 'src/app/app.module';
import { CrudService } from 'src/app/services/socket/crud.service';
import { CardFormComponent } from '../components/card-form/card-form.component';
import { DashboardCard } from '../models/dashboard.model';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  rowHeight: number;
  rowWidth: number;
  numCols: number;

  private _dashboard$: Observable<DashboardCard[]>

  constructor(
    private dialog: MatDialog,
    private crud: CrudService, 
    private appSocket: AppSocket
  ) { }

  getDashboard() {
    this.crud.read<DashboardCard[]>('dashboard_cards');
    if (!this._dashboard$) {
      this._dashboard$ = this.appSocket.fromEvent<DashboardCard[]>('dashboard_cards:response').pipe(shareReplay(1));
    }
    return this._dashboard$;
  }

  editCard(card: DashboardCard) {
    this.dialog.open(CardFormComponent, {
      data: {
        new: false,
        card: card
      }
    });
  }

  addCard(card: DashboardCard) {
    this.crud.create<DashboardCard>('dashboard_cards', card);
  }

  updateCard(card: DashboardCard) {
    this.crud.update<DashboardCard>('dashboard_cards', card);
  }

  deleteCard(card: DashboardCard) {
    this.crud.delete<DashboardCard>('dashboard_cards', card);
  }

  updateDashboard(cards: DashboardCard[]) {
    this.appSocket.emit('dashboard_cards:reorder', cards);
  }


}
