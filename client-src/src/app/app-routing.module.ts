import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DemoGuard } from './demo/demo.guard';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { DataStreamComponent } from './features/data-stream/data-stream.component';
import { FreezeDataComponent } from './features/diagnostics/components/freeze-data/freeze-data.component';
import { DiagnosticsComponent } from './features/diagnostics/diagnostics.component';
import { MaintenanceComponent } from './features/maintenance/maintenance.component';
import { MenuComponent } from './features/menu/menu.component';
import { RealtimeCurvesComponent } from './features/realtime-curves/realtime-curves.component';
import { ConnectionParametersComponent } from './features/settings/components/connection-parameters/connection-parameters.component';
import { LogLevelComponent } from './features/settings/components/log-level/log-level.component';
import { SettingsComponent } from './features/settings/settings.component';


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
        path: 'connection-parameters', component: ConnectionParametersComponent
      },
      {
        path: 'log-level', component: LogLevelComponent
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
  imports: [RouterModule.forRoot(routes, {useHash: true})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
