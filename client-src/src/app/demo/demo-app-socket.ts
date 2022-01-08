import { Observable, of } from "rxjs";
import { DashboardCard } from "../features/dashboard/models/dashboard.model";
import { MaintenanceRecord } from "../features/maintenance/models/maintenance.model";
import { Settings } from "../features/settings/models/settings.model";

const settings: Settings = {
    vehicle: {
        make: null,
        model: null,
        year: null,
        vin: null,
    },

    connection: {
        auto: true,
        parameters: {
            portstr: null,
            baudrate: null,
            protocol: null
        },
        log_level: 'WARNING'
    }
}

const dashboardCards: DashboardCard[] = [
    {
        id: 1,
        index: 0,
        type: 'gauge.arch',
        command: 'RPM'
      },
      {
        id: 2,
        index: 1,
        type: 'gauge.arch',
        command: 'SPEED'
      },
      {
        id: 3,
        index: 2,
        type: 'gauge.full',
        command: 'ENGINE_LOAD'
      },
      {
        id: 4,
        index: 3,
        type: 'gauge.full',
        command: 'THROTTLE_POS'
      },
      {
        id: 5,
        index: 4,
        type: 'numeric',
        command: 'ELM_VOLTAGE'
      },
      {
        id: 6,
        index: 5,
        type: 'numeric',
        command: 'INTAKE_TEMP'
      },
      {
        id: 7,
        index: 6,
        type: 'numeric',
        command: 'MAF'
      },
      {
        id: 8,
        index: 7,
        type: 'numeric',
        command: 'COOLANT_TEMP'
      }
];

const maintenanceRecords: MaintenanceRecord[] = [
    {id: 1, date: new Date(), description: 'Example Job', odometer: 110000, notes: 'Add part numbers or any other info here'}
]

export class DemoAppSocket {

    oneTimeEvents: { [event: string]: Promise<any> } = {
        'settings:response': new Promise<Settings>(resolve => resolve(settings))
    }

    fromEvents: { [event: string]: Observable<any> } = {
        'settings:response': of(settings),
        'dashboard_cards:response': of(dashboardCards),
        'maintenance:response': of(maintenanceRecords)
    } 
    
    constructor(args: any) {

    }

    emit(event: string, ...args: any[]): void {
        console.log("APP EMIT", event);
    }

    fromOneTimeEvent<T>(event: string): Promise<T> {
        console.log("APP FROM ONE TIEM EVENT", event)
        return this.oneTimeEvents[event];
    }

    fromEvent<T>(event: string): Observable<T> {
        console.log("APP FROM EVENT", event);
        return this.fromEvents[event];
    }

    on(event: string, cb: Function): void {

    }
}
