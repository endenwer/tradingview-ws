import { connect, getCandles, connectAndSubscribe } from './src/index'


(async function () {
  try {
    for (const iterator of ["SOLUSDT", "BTCUSDT"]) {
      const connection = await connect()
      connectAndSubscribe({
        connection,
        symbols: [iterator],
        amount: 1,
        timeframe: 1,
        callback: (event) => {
          console.log(event)
        }
      })
    }
  } catch (error) {
    console.error(error)
  }
}());

