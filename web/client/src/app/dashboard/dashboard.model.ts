
type CardType = 'gauge.full' | 'gauge.semi' | 'gauge.arch' | 'numeric' | 'curve';

export interface Sensor {
    id?: number;
    type: CardType;
    index: number;
    command: string;
}