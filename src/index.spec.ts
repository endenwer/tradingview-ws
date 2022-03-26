import { expect } from 'chai'
import { connect, getCandles } from './index'

describe('#getCandles', function(){
  this.timeout(20000)

  it('returns candles', async function(){
    const connection = await connect()
    const candles = await getCandles({
      connection,
      symbols: ['FX:AUDCAD', 'FX:AUDCHF'],
      amount: 10,
      timeframe: '1D'
    })
    await connection.close()

    expect(candles.length).to.eq(2)
    expect(candles[0].length).to.eq(10)
    expect(candles[0][1].timestamp - candles[0][0].timestamp).to.eq(24 * 60 * 60)
  })

  it('returns all available candles', async function() {
    const connection = await connect()
    const candles = await getCandles({
      connection,
      symbols: ['FX:AUDCAD'],
    })
    await connection.close()

    // experimentally found that tradingview
    // can send maximum around 13000 hourly candles
    expect(candles[0].length).to.gt(10_000)
  })

  it('returns empty candles for incorrect symbol', async function() {
    const connection = await connect()
    const candles = await getCandles({
      connection,
      symbols: ['FX:AUDCAD', 'UNKNOWN'],
    })
    await connection.close()

    expect(candles[0].length).to.gt(10_000)
    expect(candles[1].length).to.eq(0)
  })
})
