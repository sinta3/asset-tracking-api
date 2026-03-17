const { createLogger, format, transports } = require('winston')

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.errors({ stack: true }),
    format.splat(),
    format.printf(({ timestamp, level, message, stack, ...meta }) => {
      const metaInfo = Object.keys(meta).length
        ? `\n${JSON.stringify(meta, null, 2)}`
        : ''
      return stack
        ? `[${timestamp}] ${level}: ${message}\n${stack}${metaInfo}`
        : `[${timestamp}] ${level}: ${message}${metaInfo}`
    })
  ),
  transports: [new transports.Console()],
})

module.exports = logger
