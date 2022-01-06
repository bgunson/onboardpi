import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './modules/dashboard/dashboard.component';
import { DataStreamComponent } from './modules/data-stream/data-stream.component';
import { DiagnosticsComponent } from './modules/diagnostics/diagnostics.component';
import { MaintenanceComponent } from './modules/maintenance/maintenance.component';
import { MenuComponent } from './modules/menu/menu.component';
import { RealtimeCurvesComponent } from './modules/realtime-curves/realtime-curves.component';
import { ConnectionParametersComponent } from './modules/settings/components/connection-parameters/connection-parameters.component';
import { SettingsComponent } from './modules/settings/settings.component';

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
    path: 'maintenance', component: MaintenanceComponent
  },
  {
    path: 'settings',
    children: [
      {
        path: '', component: SettingsComponent
      },
      {
        path: 'connection-params', component: ConnectionParametersComponent
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
