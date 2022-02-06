export interface SysInfo {
    cpu: CPU;
    mem: Memory;
    network: Network[];
    storage: Storage[];
}


export interface Network {
    iface: string;
    ifaceName: string;
    ip4: string;
    ip4subnet: string;
    ip6: string;
    ip6subnet: string;
    mac: string;
    internal: boolean;
    virtual: boolean;
    operstate: string;
    type: string;
    duplex: string;
    mtu: number;
    speed: number;
    dhcp: boolean;
    dnsSuffix: string;
    ieee8021xAuth: string;
    ieee8021xState: string;
    carrierChanges: number;
    rx_bytes: number;
    rx_dropped: number;
    rx_errors: number;
    tx_bytes: number;
    tx_dropped: number;
    tx_errors: number;
    rx_sec: number;
    tx_sec: number;
    ms: number;
}

export interface CPU {
    load: number; // %
    speed: number; // GHz
    temp: number; // *c
}

export interface Memory {
    total: number;  // bytes
    free: number;   // bytes
    used: number;   // bytes
    active: number; // bytes
}

export interface Storage {
    fs: string;
    type: string;
    size: number;
    used: number;
    available: number;
    use: number;
    mount: string;
}