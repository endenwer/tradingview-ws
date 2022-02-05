## Tradingview websocket integration
Unoficial library to interact with websockets on Tradingview.

## Features
- Realtime data from Tradingview
- Authorization with session id from cookies
- Fetching candlesticks for any symbol with any available timeframe

## Example
```ts
import { connect, getCandles } from 'tradingview-ws'

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
```
