import { AfterViewInit, Component, Input, OnDestroy, OnInit, QueryList, ViewChildren } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { DisplayService } from 'src/app/shared/services/display.service';
import { ActionService } from 'src/app/shared/services/action.service';
import { OBDService } from 'src/app/shared/services/obd.service';
import { Sensor } from './dashboard.model';
import { DashboardService } from './dashboard.service';
import { CdkDragDrop, CdkDragEnter, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import { MatDialog } from '@angular/material/dialog';
import { CardFormComponent } from './components/card-form/card-form.component';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy, AfterViewInit {


  @Input() data: any;

  dashboard: Sensor[];
  watchList: string[];
  subscriptions: Subscription = new Subscription();
  
  vehicleConnected$: Observable<boolean>;
  status$: Observable<string>;

  config: any;

  numCols: number = 2;


  @ViewChildren(CdkDropList) dropsQuery: QueryList<CdkDropList>;

  drops: CdkDropList[];

  constructor(
    private obd: OBDService, 
    public dashboardService: DashboardService,
    private action: ActionService,
    public display: DisplayService,
    private dialog: MatDialog
  ) { }

  track = (index: number, card: Sensor) => card.command + card.index + card.type;

  setDimensions() {
    if (window.innerWidth < window.innerHeight) {
      this.dashboardService.numCols = 2;
      this.dashboardService.rowHeight = window.innerWidth / 4;
      this.dashboardService.rowWidth = (window.innerWidth / this.dashboardService.numCols) - 6;
    } else {
      this.dashboardService.numCols = 3;
      this.dashboardService.rowHeight = window.innerWidth / 8;
      this.dashboardService.rowWidth = (window.innerWidth / this.dashboardService.numCols) - 21;
    }
  }

  getColspan(card: Sensor) {
    if (card.type === 'curve') {
      return 2;
    } else {
      return 1;
    }
  }

  getRowspan(card: Sensor) {
    if (card.type === 'numeric') {
      return 1;
    } else {
      return 2;
    }
  }
  
  isGauge(card: Sensor) {
    return card.type.startsWith('gauge');
  }

  edit(card: Sensor) {
    this.dialog.open(CardFormComponent, {
      data: {
        new: false,
        card: {...card}
      }
    });
  }
  
  drop(event: CdkDragDrop<any>) {
    this.dashboard.forEach((card, i) => card.index = i);
    this.dashboardService.updateDashboard(this.dashboard);
  }

  entered($event: CdkDragEnter) {
    moveItemInArray(this.dashboard, $event.item.data, $event.container.data);
  }
  

  ngAfterViewInit(): void {
    this.dropsQuery.changes.subscribe(() => {
      this.drops = this.dropsQuery.toArray()
    })
    Promise.resolve().then(() => {
      this.drops = this.dropsQuery.toArray();
    })
  }


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
