import { Injectable, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { Socket, SocketIoModule } from 'ngx-socket-io';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DashboardModule } from './features/dashboard/dashboard.module';
import { DiagnosticsModule } from './features/diagnostics/diagnostics.module';
import { SettingsModule } from './features/settings/settings.module';
import { RealtimeCurvesModule } from './features/realtime-curves/realtime-curves.module';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { DataStreamModule } from './features/data-stream/data-stream.module';
import { MenuModule } from './features/menu/menu.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@Injectable()
export class OBDSocket extends Socket {
  constructor() {
    super({ 
      url: 'http://' + window.location.hostname + ':60000',
      options: { 
        transports: ['websocket'] 
      }
    });
  }
}

@Injectable()
export class AppSocket extends Socket {
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
    RealtimeCurvesModule,
    DiagnosticsModule,
    SettingsModule,
    DataStreamModule,
    MenuModule,

    MatIconModule,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatButtonModule
    
  ],
  providers: [OBDSocket, AppSocket],
  bootstrap: [AppComponent]
})
export class AppModule { }
