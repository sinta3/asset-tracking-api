const express = require('express')
const router = express.Router()
const { registerUser, loginUser } = require('../controllers/auth.controller')
const {
  registerUserSchema,
  loginUserSchema,
} = require('../validations/auth.validation')
const {
  validateRequest,
} = require('../middlewares/request-validation.middleware')

router.post('/register', validateRequest(registerUserSchema), registerUser)
router.post('/login', validateRequest(loginUserSchema), loginUser)

module.exports = router
