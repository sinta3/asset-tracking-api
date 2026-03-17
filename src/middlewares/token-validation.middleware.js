const jwt = require('jsonwebtoken')
const { JWT_ACCESS_TOKEN_SECRET } = require('../config/environment.config')
const { throwCustomError } = require('../utils/response.utils')

const validateTokenUser = (req, res, next) => {
  const authHeader = req.headers['authorization']
  if (!authHeader?.startsWith('Bearer ')) {
    throwCustomError('Missing or invalid Authorization header', 401)
  }

  const token = authHeader.split(' ')[1]
  try {
    const decoded = jwt.verify(token, JWT_ACCESS_TOKEN_SECRET)

    req.user = decoded
    next()
  } catch (err) {
    next(err)
  }
}

const validateTokenAdmin = (req, res, next) => {
  const authHeader = req.headers['authorization']
  if (!authHeader?.startsWith('Bearer ')) {
    throwCustomError('Missing or invalid Authorization header', 401)
  }

  const token = authHeader.split(' ')[1]
  try {
    const decoded = jwt.verify(token, JWT_ACCESS_TOKEN_SECRET)
    if (decoded.user_type !== 'admin') {
      throwCustomError('Forbidden to access this resource', 401)
    }

    req.user = decoded
    next()
  } catch (err) {
    next(err)
  }
}

module.exports = {
  validateTokenUser,
  validateTokenAdmin,
}
