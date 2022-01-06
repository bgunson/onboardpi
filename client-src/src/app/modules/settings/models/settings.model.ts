
export interface Settings {
    vehicle: Vehicle;
    connection: ConnectionParameters
}

export interface Vehicle {
    make: string;
    model: string;
    year: number;
    vin: string;
}

export interface ConnectionParameters {
    auto: boolean;
    parameters: {
        portstr: string | null;
        baudrate: number | null;
        protocol: string | null;
    } 
}