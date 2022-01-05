import { AfterViewInit, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { DisplayService } from 'src/app/services/display.service';
import { ActionService } from 'src/app/services/action.service';
import { OBDService } from 'src/app/services/socket/obd.service';
import { DashboardCard } from './models/dashboard.model';
import { DashboardService } from './services/dashboard.service';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { MatDialog } from '@angular/material/dialog';
import { CardFormComponent } from './components/card-form/card-form.component';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy, AfterViewInit {


  @Input() data: any;

  dashboard: DashboardCard[];
  watchList: string[];
  subscriptions: Subscription = new Subscription();
  
  vehicleConnected$: Observable<boolean>;
  status$: Observable<string>;

  config: any;

  numCols: number = 2;

  constructor(
    private obd: OBDService, 
    public dashboardService: DashboardService,
    private action: ActionService,
    private display: DisplayService,
    private dialog: MatDialog
  ) { }

  track = (index: number, card: DashboardCard) => card.command + card.index + card.type;

  setDimensions() {
    if (window.innerWidth < window.innerHeight) {
      this.dashboardService.numCols = 2;
      this.dashboardService.rowHeight = window.innerWidth / 4;
      this.dashboardService.rowWidth = (window.innerWidth / this.dashboardService.numCols) - 6;
    } else {
      this.dashboardService.numCols = 3;
      this.dashboardService.rowHeight = (window.innerWidth + 60) / 8;
      this.dashboardService.rowWidth = (window.innerWidth / this.dashboardService.numCols) - 21;
    }
  }

  getColspan(card: DashboardCard) {
    if (card.type === 'curve') {
      return 2;
    } else {
      return 1;
    }
  }

  getRowspan(card: DashboardCard) {
    if (card.type === 'numeric') {
      return 1;
    } else {
      return 2;
    }
  }
  
  isGauge(card: DashboardCard) {
    return card.type.startsWith('gauge');
  }

  edit(card: DashboardCard) {
    this.dialog.open(CardFormComponent, {
      data: {
        new: false,
        card: {...card}
      }
    });
  }
  
  drop(event: CdkDragDrop<DashboardCard[]>) {
    moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    this.dashboard.forEach((card, index) => {
      card.index = index;
    });
    this.dashboardService.updateDashboard(this.dashboard);
  }


  ngAfterViewInit(): void {
  }
  test: boolean;
  ngOnInit(): void {
    this.action.setAction('dashboard_customize');
    this.setDimensions();
    
    this.vehicleConnected$ = this.obd.isConnected();

    // Subscribe to sreen orientation
    this.subscriptions.add(this.display.isPortrait$.subscribe(() => this.setDimensions()));

    // Subscribe to the dashboard card database table 
    this.subscriptions.add(this.dashboardService.getDashboard().subscribe(dashboard => {
      this.dashboard = dashboard.sort((a, b) => a.index - b.index);
      this.watchList = dashboard.map(card => card.command);
      this.obd.watch(this.watchList);
    }));

    // Subscribe to unwatch events so we can re-watch the dashboard
    this.subscriptions.add(this.obd.unwatched.subscribe(() => this.watchList ? this.obd.watch(this.watchList) : null));

    // Subscribe to the action button click event
    this.subscriptions.add(this.action.actionClick.subscribe(() => {
       this.dialog.open(CardFormComponent, {
         data: {
           new: true,
           card: {
             index: this.dashboard.length,
             type: "",
             command: ""
           }
         }
       })
    }));
  }

  ngOnDestroy() {
    this.obd.unwatch(this.watchList);
    this.subscriptions.unsubscribe();
  }


}
