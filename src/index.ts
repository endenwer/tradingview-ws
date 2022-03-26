import axios from 'axios'
import WebSocket from 'ws'
import randomstring from "randomstring"

const MAX_BATCH_SIZE = 5000 // found experimentally

type Subscriber = (event: TradingviewEvent) => void
type Unsubscriber = () => void

type MessageType = 'ping' | 'session' | 'event'

interface RawCandle {
  i: number
  v: number[]
}

export interface Candle {
  timestamp: number
  high: number
  low: number
  open: number
  close: number
  volume: number
}

interface MessagePayload {
  type: MessageType
  data: any
}

interface TradingviewConnection {
  subscribe: (handler: Subscriber) => Unsubscriber
  send: (name: string, params: any[]) => void
  close: () => Promise<void>
}

interface ConnectionOptions {
  sessionId?: string
}

interface TradingviewEvent {
  name: string,
  params: any[]
}

type TradingviewTimeframe = number | '1D' | '1W' | '1M'

function parseMessage(message: string): MessagePayload[] {
  if (message.length === 0) return []

  const events = message.toString().split(/~m~\d+~m~/).slice(1)

  return events.map(event => {
    if (event.substring(0, 3) === "~h~") {
      return { type: 'ping', data: `~m~${event.length}~m~${event}` }
    }

    const parsed = JSON.parse(event)

    if (parsed['session_id']) {
      return { type: 'session', data: parsed }
    }

    return { type: 'event', data: parsed }
  })
}

export async function connect(options: ConnectionOptions = {}): Promise<TradingviewConnection> {
  let token = 'unauthorized_user_token'

  if (options.sessionId) {
    const resp = await axios({
      method: 'get',
      url: 'https://www.tradingview.com/disclaimer/',
      headers: { "Cookie": `sessionid=${options.sessionId}` }
    })
    token = resp.data.match(/"auth_token":"(.+?)"/)[1]
  }

  const connection = new WebSocket("wss://prodata.tradingview.com/socket.io/websocket", {
    origin: "https://prodata.tradingview.com"
  })

  const subscribers: Set<Subscriber> = new Set()

  function subscribe(handler: Subscriber): Unsubscriber {
    subscribers.add(handler)
    return () => {
      subscribers.delete(handler)
    }
  }

  function send(name: string, params: any[]) {
    const data = JSON.stringify({ m: name, p: params })
    const message = "~m~" + data.length + "~m~" + data
    connection.send(message)
  }

  async function close() {
    return new Promise<void>((resolve, reject) => {
      connection.on('close', resolve)
      connection.on('error', reject)
      connection.close()
    })
  }

  return new Promise<TradingviewConnection>((resolve, reject) => {
    connection.on('error', error => reject(error))

    connection.on('message', message => {
      const payloads = parseMessage(message.toString())

      for (const payload of payloads) {
        switch (payload.type) {
          case 'ping':
            connection.send(payload.data)
            break;
          case 'session':
            send('set_auth_token', [token])
            resolve({ subscribe, send, close })
            break;
          case 'event':
            const event = {
              name: payload.data.m,
              params: payload.data.p
            }
            subscribers.forEach(handler => handler(event))
            break;
          default:
            throw new Error(`unknown payload: ${payload}`)
        }
      }
    })
  })
}

interface GetCandlesParams {
  connection: TradingviewConnection,
  symbols: string[],
  amount?: number
  timeframe?: TradingviewTimeframe
}

export async function getCandles({ connection, symbols, amount, timeframe = 60 }: GetCandlesParams) {
  if (symbols.length === 0) return []

  const chartSession = "cs_" + randomstring.generate(12)
  const batchSize = amount && amount < MAX_BATCH_SIZE ? amount : MAX_BATCH_SIZE

  return new Promise<Candle[][]>(resolve => {
    const allCandles: Candle[][] = []
    let currentSymIndex = 0
    let symbol = symbols[currentSymIndex]
    let currentSymCandles: RawCandle[] = []

    const unsubscribe = connection.subscribe(event => {
      // received new candles
      if (event.name === 'timescale_update') {
        let newCandles: RawCandle[] = event.params[1]['sds_1']['s']
        if (newCandles.length > batchSize) {
          // sometimes tradingview sends already received candles
          newCandles = newCandles.slice(0, -currentSymCandles.length)
        }
        currentSymCandles = newCandles.concat(currentSymCandles)
        return
      }

      // loaded all requested candles
      if (['series_completed', 'symbol_error'].includes(event.name)) {
        const loadedCount = currentSymCandles.length
        if (loadedCount > 0 && loadedCount % batchSize === 0 && (!amount || loadedCount < amount)) {
          connection.send('request_more_data', [chartSession, 'sds_1', batchSize])
          return
        }

        // loaded all candles for current symbol

        if (amount) currentSymCandles = currentSymCandles.slice(0, amount)

        const candles = currentSymCandles.map(c => ({
          timestamp: c.v[0],
          open: c.v[1],
          high: c.v[2],
          low: c.v[3],
          close: c.v[4],
          volume: c.v[5]
        }))
        allCandles.push(candles)

        // next symbol
        if (symbols.length - 1 > currentSymIndex) {
          currentSymCandles = []
          currentSymIndex += 1
          symbol = symbols[currentSymIndex]
          connection.send('resolve_symbol', [
            chartSession,
            `sds_sym_${currentSymIndex}`,
            '=' + JSON.stringify({ symbol, adjustment: 'splits' })
          ])

          connection.send('modify_series', [
            chartSession,
            'sds_1',
            `s${currentSymIndex}`,
            `sds_sym_${currentSymIndex}`,
            timeframe.toString(),
            ''
          ])
          return
        }

        // all symbols loaded
        unsubscribe()
        resolve(allCandles)
      }
    })

    connection.send('chart_create_session', [chartSession, ''])
    connection.send('resolve_symbol', [
      chartSession,
      `sds_sym_0`,
      '=' + JSON.stringify({ symbol, adjustment: 'splits' })
    ])
    connection.send('create_series', [
      chartSession, 'sds_1', 's0', 'sds_sym_0', timeframe.toString(), batchSize, ''
    ])
  })
}
