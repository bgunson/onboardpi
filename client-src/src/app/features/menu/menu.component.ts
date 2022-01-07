import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { Subscription } from 'rxjs';
import { ActionService } from 'src/app/shared/services/action.service';
import { CarConnectionComponent } from './components/car-connection/car-connection.component';

interface View {
  name: string;
  link: string;
  icon: string;
}

const VIEWS: View[] = [
  {
      name: 'Dashboard',
      link: '/dashboard',
      icon: 'speed'
  },
  {
      name: 'Diagnostics',
      link: '/diagnostics',
      icon: 'build'
  },
  {
      name: 'Data Stream',
      link: '/data-stream',
      icon: 'stream'
  },
  {
      name: 'Realtime Curves',
      link: '/realtime-curves',
      icon: 'show_chart'
  },
  {
      name: 'Maintenance',
      link: '/maintenance',
      icon: 'description'
  },
  // {
  //     name: 'Lookup',
  //     link: '/lookup',
  //     icon: 'search'
  // },
  {
      name: 'Settings',
      link: '/settings',
      icon: 'settings'
  }
]

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit, OnDestroy {

  routes = VIEWS;

  subscription: Subscription = new Subscription();

  constructor(
    private action: ActionService,
    private bottomSheet: MatBottomSheet
  ) { }


  ngOnInit(): void {
    this.action.setAction('directions_car');
    this.subscription = this.action.actionClick.subscribe(() => this.bottomSheet.open(CarConnectionComponent));
  }

  ngOnDestroy(): void {
      this.subscription.unsubscribe();
      this.action.clearAction();
  }

}
