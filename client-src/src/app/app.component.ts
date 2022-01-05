import { Component, OnInit } from '@angular/core';
import { AppSocket } from './app.module';
import { DisplayService } from './services/display.service';
import { ActionService } from './services/action.service';
import { OBDService } from './services/socket/obd.service';
import { ActivatedRoute, ActivatedRouteSnapshot, NavigationEnd, Router } from '@angular/router';
import { Route } from '@angular/compiler/src/core';
import { map, skip, startWith } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'carpi-client';

  route$: Observable<string | undefined>;

  // isPortrait: boolean;

  // isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
  //   .pipe(
  //     map(result => result.matches),
  //     shareReplay()
  //   );

  obdConnected: Promise<boolean>;

  constructor(
    public display: DisplayService, 
    private obd: OBDService,
    public action: ActionService,
    private appSocket: AppSocket,
    private router: Router
  ) {

    this.appSocket.on('obd:reconnect', (msg: string) => {
      var reconnect;
      if (msg)
        reconnect = window.confirm(msg);
      if (reconnect) 
        this.appSocket.emit('obd:reconnect');
        this.obd.getConnection();
    });

  }

  get route() {
    return this.router.url.slice(1);
  }

  refresh() {
    window.location.reload();
  }
  
  ngOnInit() {
    this.display.checkTheme();
    if (environment.production)
      this.obd.getConnection();
  }

}
