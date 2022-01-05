export interface MaintenanceRecord {
    date: Date;
    id?: number;
    description: string;
    notes: string;
    odometer?: number;
}