
export interface OBDCommand {
    name: string;
    desc: string;
    decoder?: string;
    mode?: number;
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
