import { Injectable } from '@angular/core';
import { RealtimeChartData } from 'ngx-graph';
import { Subscription } from 'rxjs';
import { throttleTime } from 'rxjs/operators';
import { OBDService } from 'src/app/shared/services/obd.service';

interface Curves {
  [cmd: string]: RealtimeChartData[];
}

@Injectable({
  providedIn: 'root'
})
export class CurveDataService {

  MAX_SIZE = 200;
  private _curves: Set<string> = new Set<string>();
  private _curveData: Curves = {};
  private _curveDataSubscription: Subscription;


  constructor(private obd: OBDService) {
    this.pushData();
  }

  pushData() {
    this._curveDataSubscription = this.obd.getWatching().pipe(throttleTime(250)).subscribe(data => {
      // console.log(this._curveData);
      [...this._curves].forEach((cmd: string) => {

        let cmdData = data[cmd];
        this._curveData[cmd] = this._curveData[cmd] || [];

        // If curve not defined yet push a data point that is a minute old so chart is drawn across screen
        if (this._curveData[cmd].length === 0) {
          this._curveData[cmd].push({
            date: new Date(Date.now() - 60000),
            value: 0
          });
        }

        // Push latest value, if number
        if (cmdData && !isNaN(cmdData.value)) {
          this._curveData[cmd].push({
            date: new Date(cmdData.time),
            value: cmdData.value
          });
        }

        // Shift array if larger than max size
        if (this._curveData[cmd].length > this.MAX_SIZE) {
          this._curveData[cmd].shift();
        }
      });
    });
  }

  unsubscribeFromCurveData() {
    this._curveDataSubscription.unsubscribe();
  }

  addCurve(command: string) {
    this._curves.add(command);
  }

  removeCurve(command: string) {
    this._curves.delete(command);
  }

  getCurve(command: string): RealtimeChartData[] {
    return this._curveData[command];
  }

}
