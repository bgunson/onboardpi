
type CardType = 'gauge.full' | 'gauge.semi' | 'gauge.arch' | 'numeric' | 'curve';

export interface DashboardCard {
    id?: number;
    type: CardType;
    index: number;
    command: string;
}