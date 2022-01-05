import { Component, Input, OnInit } from '@angular/core';
import { RealtimeChartData, RealtimeChartOptions } from 'ngx-graph';
import { Observable } from 'rxjs';
import { pluck } from 'rxjs/operators';
import { OBDResponse } from 'src/app/models/obd.model';
import { CurveDataService } from 'src/app/modules/realtime-curves/services/curve-data.service';
import { DisplayService } from 'src/app/services/display.service';
import { FormatService } from 'src/app/services/format.service';
import { OBDService } from 'src/app/services/socket/obd.service';
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

  chartData: RealtimeChartData[][];

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
    public format: FormatService,
    private obd: OBDService,
    public dashboardService: DashboardService, 
    private display: DisplayService
  ) { }


  ngOnInit(): void {
    this.curveData.addCurve(this.card.command);

    if (this.curveOptions.lines) {
      this.curveOptions.lines[0].color = this.display.defaultColor;
        this.curveOptions.lines[0].areaColor = this.display.defaultColor;
    }

    setTimeout(() => {
      this.chartData = [this.curveData.getCurve(this.card.command)];
    }, 500);

    this.live$ = this.obd.getWatching().pipe(pluck(this.card.command));

  }

}
