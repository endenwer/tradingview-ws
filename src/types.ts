export const MAX_BATCH_SIZE = 5000 // found experimentally

export type Subscriber = (event: TradingviewEvent) => void
export type Unsubscriber = () => void
export type MessageType = 'ping' | 'session' | 'event'

export interface RawCandle {
  i: number
  v: number[]
}

export interface GetCandlesParams {
  connection: TradingviewConnection,
  symbols: string[],
  amount?: number
  timeframe?: TradingviewTimeframe
  // callback: (event: any) => void
}
export interface Candle {
  timestamp: number
  high: number
  low: number
  open: number
  close: number
  volume: number
}

export interface MessagePayload {
  type: MessageType
  data: any
}

export interface TradingviewConnection {
  subscribe: (handler: Subscriber) => Unsubscriber
  send: (name: string, params: any[]) => void
  close: () => Promise<void>
}

export interface ConnectionOptions {
  sessionId?: string
}

export interface TradingviewEvent {
  name: string,
  params: any[],
}

export type TradingviewTimeframe = number | '1D' | '1W' | '1M'