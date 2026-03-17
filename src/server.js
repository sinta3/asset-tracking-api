const app = require('./app')
const { initDb, closeDb } = require('./config/db.config')
const logger = require('./utils/logger.utils')
const { PORT } = require('./config/environment.config')
const portApp = PORT || 3000

const server = app.listen(portApp, async () => {
  const start = Date.now()
  await initDb()
  logger.info(
    `Server started in ${Date.now() - start} ms. Listening on port ${portApp}`
  )
})

server.on('error', (err) => {
  process.exit(1)
})

process.on('SIGINT', async () => {
  logger.info('[SIGINT] Server shutting down....')

  await new Promise((res, rej) => server.close((e) => (e ? rej(e) : res())))
  await closeDb()
  process.exit(0)
})

process.on('SIGTERM', async () => {
  logger.info('[SIGTERM] Server shutting down....')

  await new Promise((res, rej) => server.close((e) => (e ? rej(e) : res())))
  await closeDb()
  process.exit(0)
})
