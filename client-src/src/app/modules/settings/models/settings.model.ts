
export interface Settings {
    vehicle: Vehicle;
    connection: Connection
}

export interface Vehicle {
    make: string;
    model: string;
    year: number;
    vin: string;
}

export interface Connection {
    auto: boolean;
    parameters: {
        portstr: string | null;
        baudrate: number | null;
        protocol: string | null;
    } 
}