import { Injectable, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { Socket, SocketIoModule } from 'ngx-socket-io';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DashboardModule } from './dashboard/dashboard.module';
import { DiagnosticsModule } from './diagnostics/diagnostics.module';
import { SettingsModule } from './settings/settings.module';
import { RealtimeCurvesModule } from './realtime-curves/realtime-curves.module';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { DataStreamModule } from './data-stream/data-stream.module';
import { MenuModule } from './menu/menu.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { environment } from 'src/environments/environment';
import { MaintenanceModule } from './maintenance/maintenance.module';
// import { ServiceWorkerModule } from '@angular/service-worker';



@Injectable()
export class OBDSocket extends environment.obdSocket {
  constructor() {
    super({ 
      url: `http://${window.location.hostname}:60000`,
      options: { 
        transports: ['websocket'] 
      }
    });
  }
}

@Injectable()
export class AppSocket extends environment.appSocket {
  constructor() {
    super({
      url: window.origin,
      options: {
        transports: ['websocket']
      }
    });
  }
}


@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    CommonModule,
    AppRoutingModule,

    SocketIoModule,

    DashboardModule,
    MaintenanceModule,
    RealtimeCurvesModule,
    DiagnosticsModule,
    SettingsModule,
    DataStreamModule,
    MenuModule,

    MatIconModule,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatButtonModule,
    // ServiceWorkerModule.register('ngsw-worker.js', {
    //   enabled: environment.production,
    //   // Register the ServiceWorker as soon as the app is stable
    //   // or after 30 seconds (whichever comes first).
    //   registrationStrategy: 'registerImmediately'
    // }),
    
  ],
  providers: [OBDSocket, AppSocket],
  bootstrap: [AppComponent]
})
export class AppModule { }
