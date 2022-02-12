import { AfterViewInit, Component, OnInit } from '@angular/core';
import { AppSocket } from './app.module';
import { DisplayService } from './shared/services/display.service';
import { ActionService } from './shared/services/action.service';
import { OBDService } from './shared/services/obd.service';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, AfterViewInit {
  title = 'onboardpi-client';

  route$: Observable<string | undefined>;
  obdConnected: Promise<boolean>;

  constructor(
    public display: DisplayService, 
    private obd: OBDService,
    public action: ActionService,
    private appSocket: AppSocket,
    private router: Router,
  ) {

    // this.appSocket.on('obd:reconnect', (msg: string) => {
    //   var reconnect;
    //   if (msg)
    //     reconnect = window.confirm(msg);
    //   if (reconnect) 
    //     this.appSocket.emit('obd:reconnect');
    //     this.obd.getConnection();
    // });

  }

  get route() {
    return this.router.url.slice(1);
  }

  refresh() {
    window.location.reload();
  }

  back() {
    let urlSeg: string[] = this.router.url.split('/');
    if (urlSeg.length === 0) {
      urlSeg = ['/']
    } else {
      urlSeg.pop();
    }
    console.log(urlSeg)
    this.router.navigateByUrl(urlSeg.join('/'));
  }

  ngAfterViewInit(): void {
      if (environment.demo && !sessionStorage.getItem('demo')) {
        this.router.navigateByUrl('demo');
      }
  }
  
  ngOnInit() {
    this.display.checkTheme();
  }

}
