const express = require('express')
const errorHandler = require('./middlewares/error-handler.middleware')
const authRoutes = require('./routes/auth.routes')
const assetRoutes = require('./routes/asset.routes')
const rateLimiter = require('./middlewares/rate-limiter.middleware')

const app = express()
app.use(express.json())

app.get('/api/healthcheck', (req, res) => {
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
  })
})

app.use('/api/auth', authRoutes)
app.use('/api/assets', rateLimiter, assetRoutes)

app.use(errorHandler)

module.exports = app
