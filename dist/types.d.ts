export declare const MAX_BATCH_SIZE = 5000;
export declare type Subscriber = (event: TradingviewEvent) => void;
export declare type Unsubscriber = () => void;
export declare type MessageType = 'ping' | 'session' | 'event';
export interface RawCandle {
    i: number;
    v: number[];
}
export interface GetCandlesParams {
    connection: TradingviewConnection;
    symbols: string[];
    amount?: number;
    timeframe?: TradingviewTimeframe;
}
export interface Candle {
    timestamp: number;
    high: number;
    low: number;
    open: number;
    close: number;
    volume: number;
}
export interface MessagePayload {
    type: MessageType;
    data: any;
}
export interface TradingviewConnection {
    subscribe: (handler: Subscriber) => Unsubscriber;
    send: (name: string, params: any[]) => void;
    close: () => Promise<void>;
}
export interface ConnectionOptions {
    sessionId?: string;
}
export interface TradingviewEvent {
    name: string;
    params: any[];
}
export declare type TradingviewTimeframe = number | '1D' | '1W' | '1M';
//# sourceMappingURL=types.d.ts.map