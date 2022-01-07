import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { AppSocket } from 'src/app/app.module';
import { DisplayService } from 'src/app/shared/services/display.service';
import { OBDService } from 'src/app/shared/services/obd.service';

@Component({
  selector: 'data-stream-system',
  templateUrl: './system-stream.component.html',
  styleUrls: ['./system-stream.component.scss']
})
export class SystemStreamComponent implements OnInit {

  info$: Observable<any>;
  

  constructor(
    private appSocket: AppSocket, 
    public obd: OBDService,
    public display: DisplayService
  ) { }

  ngOnInit(): void {
    this.appSocket.emit('sysInfo:join');
    this.info$ = this.appSocket.fromEvent<any>('sysInfo');
  }

  ngOnDestroy() {
    this.appSocket.emit('sysInfo:leave');
  }

}
