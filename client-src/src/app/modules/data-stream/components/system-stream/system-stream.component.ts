import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { AppSocket } from 'src/app/app.module';
import { OBDService } from 'src/app/services/socket/obd.service';

@Component({
  selector: 'data-stream-system',
  templateUrl: './system-stream.component.html',
  styleUrls: ['./system-stream.component.scss']
})
export class SystemStreamComponent implements OnInit {

  info$: Observable<any>;
  

  constructor(private appSocket: AppSocket, public obd: OBDService) { }

  ngOnInit(): void {
    this.appSocket.emit('getSysInfo');
    this.info$ = this.appSocket.fromEvent<any>('sysInfo');
  }

  ngOnDestroy() {
    this.appSocket.emit('stopSysInfo');
  }

}
