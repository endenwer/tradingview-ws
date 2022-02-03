import { expect } from 'chai'
import { connect, getCandles } from './index'

describe('#getCandles', function(){
  this.timeout(20000)

  it('returns candles', async function(){
    const connection = await connect()
    const candles = await getCandles({ connection, symbols: ['FX:AUDCAD', 'FX:AUDCHF'] })
    await connection.close()

    expect(candles.length).to.eq(2)
    expect(candles[0].length).to.not.eq(0)
  })
})
