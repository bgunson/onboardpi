import { Component, OnDestroy, OnInit } from '@angular/core';
import { RealtimeChartData, RealtimeChartOptions} from 'ngx-graph';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { pluck, throttleTime } from 'rxjs/operators';
import { OBDResponse } from 'src/app/shared/models/obd.model';
import { DisplayService } from 'src/app/shared/services/display.service';
import { OBDService } from 'src/app/shared/services/obd.service';
import { CurveDataService } from './curve-data.service';

@Component({
  selector: 'app-realtime-curves',
  templateUrl: './realtime-curves.component.html',
  styleUrls: ['./realtime-curves.component.scss']
})
export class RealtimeCurvesComponent implements OnInit, OnDestroy {

  curvePid: string;
  previousPid: string;

  unwatchSub: Subscription = new Subscription();

  commands$: Promise<string[]>;  // mode 1 commands

  value$: Observable<OBDResponse>;
  curveData: RealtimeChartData[][];
  curveLoaded$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  graphWidth: number = window.innerWidth < window.innerHeight ? window.innerWidth : window.innerWidth - 66;
  graphHeight: number = window.innerHeight * 0.75;

  curveOptions: RealtimeChartOptions = {
    height: this.graphHeight,
    width: this.graphWidth,
    loadingOverlayColor: '#ffffff00',
    margin: { left: -5, right: 0 },
    lines: [
      { lineWidth: 3, area: true, areaOpacity: .2 }
    ],
    xGrid: { tickPadding: 5, dashed: false, opacity: 0},
    yGrid: { enable: false, tickNumber: 5, tickPadding: -5 }
  };

  constructor(
    private curveDataService: CurveDataService,
    private obd: OBDService, 
    public display: DisplayService,
  ) { }


  setCurve() {
    this.curveLoaded$.next(false);
    this.curveData = [];
    this.curveDataService.addCurve(this.curvePid);
    setTimeout(() => {
      this.curveData = [this.curveDataService.getCurve(this.curvePid)];
      this.curveLoaded$.next(true);
    }, 1000);
  }

  setCurvePid() {
    localStorage.setItem('curvePid', this.curvePid);
    this.obd.unwatch([this.previousPid]);
    this.obd.watch([this.curvePid]);
    this.previousPid = this.curvePid;
    this.setLiveValue();
    this.setCurve();
  }

  setLiveValue() {
    this.value$ = this.obd.getWatching().pipe(
      // delay(1000), // should we delay to line up with the curve ?
      throttleTime(500),
      pluck(this.curvePid)
    );
  }

  ngOnInit(): void {
        
    if (this.curveOptions.lines) {
      this.curveOptions.lines[0].color = this.display.defaultColor;
      this.curveOptions.lines[0].areaColor = this.display.defaultColor;
    }

    this.commands$ = this.obd.allCommands()
      .then(all => all[1].map(cmd => cmd.name).sort());

    this.curvePid = localStorage.getItem('curvePid') || "ENGINE_RPM";
    this.setCurvePid();
  }

  ngOnDestroy() {
    this.unwatchSub.unsubscribe();
    this.obd.unwatch([this.curvePid]);
  }

}
