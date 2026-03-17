const Joi = require('joi')

const registerUserSchema = Joi.object({
  user_name: Joi.string().min(1).max(255).required(),
  email: Joi.string().email().required(),
  user_type: Joi.string().valid('admin', 'member').required(),
  password: Joi.string()
    .min(8)
    .max(30)
    .pattern(/[a-z]/, 'lowercase')
    .pattern(/[A-Z]/, 'uppercase')
    .pattern(/[0-9]/, 'number')
    .pattern(/[!@#$%^&*]/, 'special')
    .required(),
  organization_name: Joi.string().min(1).max(255).required(),
})

const loginUserSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
})

module.exports = {
  registerUserSchema,
  loginUserSchema,
}
