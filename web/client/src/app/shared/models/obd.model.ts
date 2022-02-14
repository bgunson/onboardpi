
export interface OBDCommand {
    name: string;
    desc: string;
    decoder?: string | null;
    mode?: number | null;
}

export interface OBDResponse {
    value: any;
    command: OBDCommand;
    unit: string;
    time: number;
}

export interface ResponseSet {
    [cmd: string]: OBDResponse
}

export interface Protocol {
    id: string;
    name: string;
}