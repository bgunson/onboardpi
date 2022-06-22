
export interface Settings {
    vehicle: Vehicle;
    connection: Connection;
    injectors: Injectors
}

export interface Vehicle {
    make: string | null;
    model: string | null;
    year: number | null;
    vin: string | null;
}

export interface Connection {
    parameters: {
        delay_cmds: number;
        portstr: string | null;
        baudrate: number | null;
        protocol: string | null;
    },
    log_level: string; 
    force_cmds: boolean;
}

export interface Injectors {
    [type: string]: any
}