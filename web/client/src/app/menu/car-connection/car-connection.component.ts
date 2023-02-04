import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
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
  connecting: boolean = false;
  
  constructor(
    public obd: OBDService, 
    public display: DisplayService,
    private snackBar: MatSnackBar
  ) { }

  connectOBD() {
    this.connecting = true;
    this.obd.connect().then((connected: boolean) => {
      if (!connected) {
        this.snackBar.open("Unable to connect to the vehicle", "Dismiss", { verticalPosition: 'top', duration: 4000 })
      } 
      this.obd.getStatus();
      this.obd.isConnected();
      this.connecting = false;
    });
  }

  disconnectOBD() {
    this.obd.disconnect();
  }

  ngOnInit(): void {
    this.obdStatus$ = this.obd.getStatus();
    this.obdConnected$ = this.obd.isConnected();
  }
}
