## Tradingview websockets integration
Unofficial library to interact with websockets on Tradingview.

## Features
- Realtime data from Tradingview
- Authorization with session id from cookies
- Fetching candlesticks for any symbol with any available timeframe

## Example
```ts
import { connect, getCandles } from 'tradingview-ws'

(async function() {
  const connection = await connect()
  const candles = await getCandles({
    connection,
    symbols: ['FX:AUDCAD', 'FX:AUDCHF'],
    amount: 10_000,
    timeframe: 60
  })
  await connection.close()
  console.log(`Candles for AUDCAD:`, candles[0])
  console.log(`Candles for AUDCHF:`, candles[1])
}());
```

## API

### `connect(options: ConnectionOptions = {}): Promise<TradingviewConnection>`

Creates new connection to tradingview websockets. Returns `TradingviewConnection`.

Options:

* 'sessionId?: string' - authorize connection if present. Can be received from cookies.

### `getCandles({ connection, symbols, amount, timeframe = 60 }: GetCandlesParams)`

Fetches all available candles for symbols. The maximum amount is around 13_000 candles for the hourly timeframe. Returns an array where each element is an array of candles for one symbol in the order it passed to the function.

### `TradingviewConnection`

Connection object. Can be used directly to receive and send data to websockets.

Methods:

* `subscribe: (handler: Subscriber) => Unsubscriber` - subscribe to wesockets events
* `send: (name: string, params: any[]) => void` - send command to websocket
* `close: () => Promise<void>` - close the connection