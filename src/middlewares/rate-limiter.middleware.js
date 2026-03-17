const { RateLimiter } = require('limiter')

const limiters = new Map()

const getLimiter = (ip) => {
  if (!limiters.has(ip)) {
    limiters.set(
      ip,
      new RateLimiter({
        tokensPerInterval: 50, // 50 request
        interval: 'minute', // for each minutes
        fireImmediately: true, // reject after exceed max request
      })
    )
  }
  return limiters.get(ip)
}

const rateLimiter = async (req, res, next) => {
  const limiter = getLimiter(req.ip)
  const hasToken = await limiter.removeTokens(1)

  if (hasToken < 0) {
    return res.status(429).json({
      message: 'Too many requests',
    })
  }

  next()
}

module.exports = rateLimiter
