const {
  JWT_ACCESS_TOKEN_SECRET,
  JWT_ACCESS_TOKEN_EXPIRED_TIME,
} = require('../config/environment.config')
const { Organizations, Users, sequelize } = require('../models')
const { throwCustomError } = require('../utils/response.utils')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const registerUserService = async (req) => {
  const { user_name, email, password, user_type, organization_name } = req.body

  let organization = await Organizations.findOne({
    where: { organization_name },
  })
  const isCreateOrg = !organization

  if (isCreateOrg && user_type === 'member') {
    throwCustomError(
      "Organization not found. user_type member couldn't register new organization",
      400
    )
  }

  const existingUser = await Users.findOne({ where: { email } })
  if (existingUser) {
    throwCustomError('User already exists', 400)
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  const transaction = await sequelize.transaction()
  try {
    if (isCreateOrg) {
      organization = await Organizations.create(
        { organization_name },
        { transaction }
      )
    }

    const orgId = organization.organization_id
    const savedUser = await Users.create(
      {
        user_name,
        user_type,
        password: hashedPassword,
        email,
        organization_id: orgId,
      },
      { transaction }
    )

    const userId = savedUser.user_id
    const tokenPayload = {
      userId,
      user_type: user_type,
      organization_id: orgId,
    }
    const token = jwt.sign(tokenPayload, JWT_ACCESS_TOKEN_SECRET, {
      expiresIn: JWT_ACCESS_TOKEN_EXPIRED_TIME,
    })
    await transaction.commit()

    return {
      access_token: token,
      user_id: userId,
    }
  } catch (err) {
    if (!transaction.finished) {
      await transaction.rollback()
    }
    throw err
  }
}

const loginUserService = async (req) => {
  const { email, password } = req.body

  const user = await Users.findOne({ where: { email } })
  if (!user) {
    throwCustomError('Invalid credentials', 401)
  }

  const isMatch = await bcrypt.compare(password, user.password)
  if (!isMatch) {
    throwCustomError('Invalid credentials', 401)
  }

  const userId = user.user_id
  const tokenPayload = {
    userId,
    user_type: user.user_type,
    organization_id: user.organization_id,
  }
  const token = jwt.sign(tokenPayload, JWT_ACCESS_TOKEN_SECRET, {
    expiresIn: JWT_ACCESS_TOKEN_EXPIRED_TIME,
  })

  return {
    access_token: token,
    user_id: userId,
  }
}

module.exports = {
  registerUserService,
  loginUserService,
}
