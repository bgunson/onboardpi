import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DemoGuard } from './demo/demo.guard';
import { DashboardComponent } from './dashboard/dashboard.component';
import { DataStreamComponent } from './data-stream/data-stream.component';
import { FreezeDataComponent } from './diagnostics/freeze-data/freeze-data.component';
import { DiagnosticsComponent } from './diagnostics/diagnostics.component';
import { MaintenanceComponent } from './maintenance/maintenance.component';
import { MenuComponent } from './menu/menu.component';
import { RealtimeCurvesComponent } from './realtime-curves/realtime-curves.component';
import { SettingsComponent } from './settings/settings.component';
import { OBDConnectionComponent } from './settings/obd-connection/obd-connection.component';
import { OapInjectorComponent } from './settings/oap-injector/oap-injector.component';
import { CommandLookupComponent } from './settings/obd-connection/command-lookup/command-lookup.component';


const routes: Routes = [
  {
    path: 'dashboard', component: DashboardComponent
  },
  {
    path: 'diagnostics',
    children: [
      {
        path: '', component: DiagnosticsComponent
      },
      {
        path: 'freeze-data', component: FreezeDataComponent
      }
    ]
  },
  {
    path: 'data-stream', component: DataStreamComponent
  },
  {
    path: 'realtime-curves', component: RealtimeCurvesComponent
  },
  {
    path: 'maintenance', component: MaintenanceComponent
  },
  {
    path: 'settings',
    children: [
      {
        path: '', component: SettingsComponent
      },
      {
        path: 'obd-connection', children: [
          {
            path: '', component: OBDConnectionComponent,
          },
          {
            path: 'command-lookup', component: CommandLookupComponent
          }
        ]
      },
      {
        path: 'oap-injector', component: OapInjectorComponent
      }
    ]
  },
  {
    path: 'demo',
    loadChildren: () => import('./demo/demo.module').then(m => m.DemoModule),
    canLoad: [DemoGuard]
  },
  {
    path: '', component: MenuComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
