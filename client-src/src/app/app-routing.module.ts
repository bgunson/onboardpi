import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { DataStreamComponent } from './features/data-stream/data-stream.component';
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
    path: 'diagnostics', component: DiagnosticsComponent
  },
  {
    path: 'data-stream', component: DataStreamComponent
  },
  {
    path: 'realtime-curves', component: RealtimeCurvesComponent
  },
  {
    path: 'maintenance', loadChildren: () => import('./features/maintenance/maintenance.module').then(m => m.MaintenanceModule)
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
    path: '', component: MenuComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {useHash: true})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
