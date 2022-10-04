import axios from 'axios'
import WebSocket, { EventEmitter } from 'ws'
import randomstring from "randomstring"
import { Candle, ConnectionOptions, GetCandlesParams, MAX_BATCH_SIZE, MessagePayload, RawCandle, Subscriber, TradingviewConnection, Unsubscriber } from './types'
import throttledQueue from 'throttled-queue'

export const EVENT_NAMES = {
  TIMESCALE_UPDATE: 'timescale_update',
  SERIES_COMPLETED: 'series_completed',
  SYMBOL_ERROR: 'symbol_error',
  RESOLVE_SYMBOL: 'resolve_symbol',
  CREATE_SERIES: 'create_series',
  REQUEST_MORE_DATA: 'request_more_data',
}

function parseMessage(message: string): MessagePayload[] {
  if (message.length === 0) return []
  const events = message.toString().split(/~m~\d+~m~/).slice(1)
  const s: MessagePayload[] = events.map(event => {
    if (event.substring(0, 3) === "~h~") {
      return { type: 'ping', data: `~m~${event.length}~m~${event}` }
    }
    const parsed = JSON.parse(event)
    if (parsed['session_id']) {
      return { type: 'session', data: parsed }
    }
    return { type: 'event', data: parsed }
  })

  return s
}

export async function connect(options: ConnectionOptions = {},): Promise<TradingviewConnection> {
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
  }).setMaxListeners(400)

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
              params: payload.data.p,
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

export async function getCandlesV2({ connection, symbols, amount = 1000, timeframe = '1D' }: GetCandlesParams) {
  if (symbols.length === 0) return [] // at most make 10 requests every second, but evenly spaced.
  const d = symbols.map(symbol => new Promise((resolve, reject) => {
    const chartSession = "cs_" + randomstring.generate(12)
    const batchSize = amount && amount < MAX_BATCH_SIZE ? amount : MAX_BATCH_SIZE
    connection.send('chart_create_session', [chartSession, ''])
    connection.send('resolve_symbol', [
      chartSession,
      `sds_sym_0`,
      '=' + JSON.stringify({ symbol, adjustment: 'splits' })
    ])
    connection.send('create_series', [
      chartSession, 'sds_1', 's0', 'sds_sym_0', timeframe.toString(), batchSize, ''
    ])
    connection.subscribe(({ name, params }) => {
      if (name === "timescale_update") {
        resolve(params[1]?.sds_1?.s)
      }
      if (name === "symbol_error") {
        resolve([])
      }
    })
  }))
  return await Promise.all(d)
}

export async function getCandles({ connection, symbols, amount, timeframe = 60 }: GetCandlesParams) {
  if (symbols.length === 0) return []

  const chartSession = "cs_" + randomstring.generate(12)
  const batchSize = amount && amount < MAX_BATCH_SIZE ? amount : MAX_BATCH_SIZE

  return new Promise<Candle[][]>(resolve => {
    const allCandles: Candle[][] = []
    let currentSymCandles: RawCandle[] = []
    let currentSymIndex = 0
    let symbol = symbols[currentSymIndex]
    connection.send('chart_create_session', [chartSession, ''])
    connection.send('resolve_symbol', [
      chartSession,
      `sds_sym_0`,
      '=' + JSON.stringify({ symbol, adjustment: 'splits' })
    ])

    connection.send('create_series', [
      chartSession, 'sds_1', 's0', 'sds_sym_0', timeframe.toString(), batchSize, ''
    ])

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
  })
}



export async function connectAndSubscribe({ connection, symbols, timeframe = 1 }: GetCandlesParams) {
  if (symbols.length === 0) return []
  const chartSession = "cs_" + randomstring.generate(12)
  const currentSymIndex = 0
  const symbol = symbols[currentSymIndex]
  connection.send('chart_create_session', [chartSession, ''])
  connection.send(EVENT_NAMES.RESOLVE_SYMBOL, [
    chartSession,
    `sds_sym_0`,
    '=' + JSON.stringify({ symbol, adjustment: 'splits' })
  ])
  connection.send(EVENT_NAMES.CREATE_SERIES, [
    chartSession, 'sds_1', 's0', 'sds_sym_0', timeframe.toString(), 1, ''
  ])
  connection.subscribe((event: any) => {
    if (event.name = "event") {
      if (event.params.p[1].sds_1?.s !== undefined) {
        const candles = {
          timestamp: event.params.p[1].sds_1.s[0].v[0],
          open: event.params.p[1].sds_1.s[0].v[1],
          high: event.params.p[1].sds_1.s[0].v[2],
          low: event.params.p[1].sds_1.s[0].v[3],
          close: event.params.p[1].sds_1.s[0].v[4],
          volume: event.params.p[1].sds_1.s[0].v[5],
          symbol
        }
        // callback(candles)
      }
    }
  })
}
