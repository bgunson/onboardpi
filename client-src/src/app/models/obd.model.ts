
export interface OBDCommand {
    name: string;
    desc: string;
}

export interface OBDResponse {
    value: any;
    command: {
        name: string;
        desc: string;
    };
    unit: string;
    time: number;
}

export interface ResponseSet {
    [cmd: string]: OBDResponse
}
