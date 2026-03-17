const {
  registerUserService,
  loginUserService,
  refreshAccessTokenService,
} = require('../services/auth.service')
const { formatResponse } = require('../utils/response.utils')

const registerUser = async (req, res, next) => {
  try {
    const registrationData = await registerUserService(req)
    res.status(201).json(formatResponse(registrationData, 'Successful request'))
  } catch (error) {
    next(error)
  }
}

const loginUser = async (req, res, next) => {
  try {
    const loginData = await loginUserService(req)
    res.status(200).json(formatResponse(loginData, 'Successful request'))
  } catch (error) {
    next(error)
  }
}

module.exports = {
  registerUser,
  loginUser,
}
