import { Candle, ConnectionOptions, GetCandlesParams, TradingviewConnection } from './types';
export declare const EVENT_NAMES: {
    TIMESCALE_UPDATE: string;
    SERIES_COMPLETED: string;
    SYMBOL_ERROR: string;
    RESOLVE_SYMBOL: string;
    CREATE_SERIES: string;
    REQUEST_MORE_DATA: string;
};
export declare function connect(options?: ConnectionOptions): Promise<TradingviewConnection>;
export declare function getCandlesV2({ connection, symbols, amount, timeframe }: GetCandlesParams): Promise<unknown[]>;
export declare function getCandles({ connection, symbols, amount, timeframe }: GetCandlesParams): Promise<Candle[][]>;
export declare function connectAndSubscribe({ connection, symbols, timeframe }: GetCandlesParams): Promise<never[] | undefined>;
//# sourceMappingURL=index.d.ts.map