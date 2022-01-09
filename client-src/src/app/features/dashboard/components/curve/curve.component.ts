import { Component, Input, OnInit } from '@angular/core';
import { RealtimeChartData, RealtimeChartOptions } from 'ngx-graph';
import { BehaviorSubject, Observable } from 'rxjs';
import { pluck } from 'rxjs/operators';
import { OBDResponse } from 'src/app/shared/models/obd.model';
import { CurveDataService } from 'src/app/features/realtime-curves/services/curve-data.service';
import { DisplayService } from 'src/app/shared/services/display.service';
import { OBDService } from 'src/app/shared/services/obd.service';
import { DashboardCard } from '../../models/dashboard.model';
import { DashboardService } from '../../services/dashboard.service';

@Component({
  selector: 'dashboard-curve',
  templateUrl: './curve.component.html',
  styleUrls: ['../../dashboard.component.scss']
})
export class CurveComponent implements OnInit {

  @Input() card: DashboardCard;

  live$: Observable<OBDResponse>;
  loaded$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  chartData: RealtimeChartData[];

  curveOptions: RealtimeChartOptions = {
    height: this.dashboardService.rowHeight * 2,
    width: this.dashboardService.rowWidth * 2,
    loadingOverlayColor: '#ffffff00',
    margin: { left: -5, right: 0 },
    lines: [
      {  area: true, areaOpacity: .2 }
    ],
    xGrid: { enable: false },
    yGrid: { enable: false }
  };

  constructor(
    private curveData: CurveDataService,
    private obd: OBDService,
    public dashboardService: DashboardService, 
    public display: DisplayService
  ) { }


  ngOnInit(): void {
    this.curveData.addCurve(this.card.command);

    if (this.curveOptions.lines) {
      this.curveOptions.lines[0].color = this.display.defaultColor;
        this.curveOptions.lines[0].areaColor = this.display.defaultColor;
    }


    setTimeout(() => {
      this.chartData = this.curveData.getCurve(this.card.command);
      this.loaded$.next(true);
    }, 1000);

    this.live$ = this.obd.getWatching().pipe(pluck(this.card.command));

  }

}
