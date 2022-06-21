import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { DisplayService } from 'src/app/shared/services/display.service';
import { OBDService } from 'src/app/shared/services/obd.service';

@Component({
  selector: 'settings-log-level',
  templateUrl: './log-level.component.html',
  styleUrls: ['./log-level.component.scss', '../../settings.component.scss']
})
export class LogLevelComponent {

  @Input() name: string;   // name of the log for download/view
  @Input() level!: string;
  @Output() levelChange = new EventEmitter<string>();

  /**
   * See https://docs.python.org/3/library/logging.html#logging-levels
   */
  levels: string[] = [
    'CRITICAL',
    'ERROR',
    'WARNING',
    'INFO',
    'DEBUG',
    // 'NOTSET'
  ];

  getLogUrl = (type: string) => `http://${window.location.hostname}:60000/${type}/${this.name}.log`

  constructor(
    public display: DisplayService,
    private obd: OBDService
  ) { }

  setLevel(level: string) {
    this.level = level;
    this.levelChange.emit(this.level);
    this.obd.setLoggerLevel(this.name, this.level);
  }

}
