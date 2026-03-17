const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { Users, Organizations } = require('../../models')
const {
  JWT_ACCESS_TOKEN_SECRET,
  JWT_ACCESS_TOKEN_EXPIRED_TIME,
} = require('../../config/environment.config')

const createOrganization = async (overrides = {}) => {
  return Organizations.create({
    organization_name: 'Test Organization',
    ...overrides,
  })
}

const createUser = async (overrides = {}) => {
  const hashedPassword = await bcrypt.hash('Password123!', 10)
  return Users.create({
    email: 'test@example.com',
    user_name: 'Test User',
    password: hashedPassword,
    user_type: 'admin',
    organization_id: 1,
    ...overrides,
  })
}

const generateToken = (user) => {
  return jwt.sign(
    {
      user_id: user.user_id,
      user_type: user.user_type,
      organization_id: user.organization_id,
    },
    JWT_ACCESS_TOKEN_SECRET,
    { expiresIn: JWT_ACCESS_TOKEN_EXPIRED_TIME }
  )
}

const setupUserWithToken = async (userOverrides = {}) => {
  const org = await createOrganization()
  const user = await createUser({
    organization_id: org.organization_id,
    ...userOverrides,
  })
  const token = generateToken(user)
  return { org, user, token }
}

module.exports = {
  createUser,
  generateToken,
  setupUserWithToken,
  createOrganization,
}
