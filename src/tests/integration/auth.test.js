const request = require('supertest')
const app = require('../../app')
const { createOrganization, createUser } = require('../helpers/auth.helpers')

describe('Auth API', () => {
  describe('POST /api/auth/register', () => {
    it('should register successfully', async () => {
      const res = await request(app).post('/api/auth/register').send({
        email: 'newuser@example.com',
        user_name: 'New User',
        password: 'Password123!',
        user_type: 'admin',
        organization_name: 'Test Org',
      })

      expect(res.status).toBe(201)
      expect(res.body.data).toHaveProperty('access_token')
    })

    it('should return 400 if email already exists', async () => {
      await createOrganization()
      await createUser({ email: 'existing@example.com' })

      const res = await request(app).post('/api/auth/register').send({
        email: 'existing@example.com',
        user_name: 'Duplicate',
        password: 'Password123!',
        user_type: 'admin',
        organization_name: 'Test Org',
      })

      expect(res.status).toBe(400)
    })

    it('should return 422 if required fields missing', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'test@example.com' })

      expect(res.status).toBe(422)
    })
  })

  describe('POST /api/auth/login', () => {
    it('should login successfully and return token', async () => {
      await createOrganization()
      await createUser({ email: 'login@example.com' })

      const res = await request(app).post('/api/auth/login').send({
        email: 'login@example.com',
        password: 'Password123!',
      })

      expect(res.status).toBe(200)
      expect(res.body.data).toHaveProperty('access_token')
    })

    it('should return 401 if password wrong', async () => {
      await createOrganization()
      await createUser({ email: 'login@example.com' })

      const res = await request(app).post('/api/auth/login').send({
        email: 'login@example.com',
        password: 'WrongPassword!',
      })

      expect(res.status).toBe(401)
    })

    it('should return 401 if user not found', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'notfound@example.com',
        password: 'Password123!',
      })
      expect(res.status).toBe(401)
    })
  })
})
