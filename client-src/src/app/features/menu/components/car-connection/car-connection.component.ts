import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { AppSocket } from 'src/app/app.module';
import { DisplayService } from 'src/app/shared/services/display.service';
import { OBDService } from 'src/app/shared/services/obd.service';

@Component({
  selector: 'app-car-connection',
  templateUrl: './car-connection.component.html',
  styleUrls: ['./car-connection.component.scss']
})
export class CarConnectionComponent implements OnInit {

  obdStatus$: Observable<string>;
  obdConnected$: Observable<boolean>;


  constructor(
    public obd: OBDService, 
    private appSocket: AppSocket,
    public display: DisplayService
  ) { }

  connectOBD() {
    this.appSocket.emit('obd:reconnect');
    this.obd.getConnection();
  }

  disconnectOBD() {
    this.appSocket.emit('obd:disconnect');
  }

  ngOnInit(): void {
    this.obdStatus$ = this.obd.getStatus();
    this.obdConnected$ = this.obd.isConnected();
  }
}
