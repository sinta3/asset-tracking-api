const request = require('supertest')
const app = require('../../app')
const {
  setupUserWithToken,
  createOrganization,
  createUser,
} = require('../helpers/auth.helpers')
const {
  createAsset,
  createAssetAssignment,
  getAssetAssignment,
} = require('../helpers/asset.helpers')

describe('Asset API', () => {
  let token
  let org
  let user

  beforeEach(async () => {
    ;({ org, user, token } = await setupUserWithToken())
  })

  describe('GET /api/assets', () => {
    it('should return paginated list of assets', async () => {
      await createAsset({
        organization_id: org.organization_id,
        serial_number: 'SN001',
      })
      await createAsset({
        organization_id: org.organization_id,
        serial_number: 'SN002',
      })

      const res = await request(app)
        .get('/api/assets')
        .set('Authorization', `Bearer ${token}`)
        .query({ page: 1, limit: 10 })

      expect(res.status).toBe(200)
      expect(res.body.data.list).toHaveLength(2)
      expect(res.body.data.pagination).toHaveProperty('total', 2)
    })

    it('should filter by asset_status', async () => {
      await createAsset({
        organization_id: org.organization_id,
        serial_number: 'SN001',
        asset_status: 'available',
      })
      await createAsset({
        organization_id: org.organization_id,
        serial_number: 'SN002',
        asset_status: 'retired',
      })

      const res = await request(app)
        .get('/api/assets')
        .set('Authorization', `Bearer ${token}`)
        .query({ asset_status: 'available' })

      expect(res.status).toBe(200)
      expect(res.body.data.list).toHaveLength(1)
      expect(res.body.data.list[0].asset_status).toBe('available')
    })

    it('should return 401 if no token', async () => {
      const res = await request(app).get('/api/assets')
      expect(res.status).toBe(401)
    })
  })

  describe('GET /api/assets/:id', () => {
    it('should return asset detail', async () => {
      const asset = await createAsset({ organization_id: org.organization_id })

      const res = await request(app)
        .get(`/api/assets/${asset.asset_id}`)
        .set('Authorization', `Bearer ${token}`)

      expect(res.status).toBe(200)
      expect(res.body.data.asset_id).toBe(asset.asset_id)
    })

    it('should return 404 if asset not found', async () => {
      const res = await request(app)
        .get('/api/assets/999')
        .set('Authorization', `Bearer ${token}`)

      expect(res.status).toBe(404)
    })
  })

  describe('POST /api/assets', () => {
    it('should create asset successfully', async () => {
      const res = await request(app)
        .post('/api/assets')
        .set('Authorization', `Bearer ${token}`)
        .send({
          asset_name: 'New Laptop',
          asset_type: 'device',
          serial_number: 'SNNEW001',
        })

      expect(res.status).toBe(201)
      expect(res.body.data).toHaveProperty('asset_id')
    })

    it('should return 422 if required fields missing', async () => {
      const res = await request(app)
        .post('/api/assets')
        .set('Authorization', `Bearer ${token}`)
        .send({ asset_name: 'Incomplete' })

      expect(res.status).toBe(422)
    })

    it('should return 400 if serial number already exists', async () => {
      await createAsset({
        organization_id: org.organization_id,
        serial_number: 'SNDUP',
      })

      const res = await request(app)
        .post('/api/assets')
        .set('Authorization', `Bearer ${token}`)
        .send({
          asset_name: 'Duplicate Asset',
          asset_type: 'device',
          serial_number: 'SNDUP',
        })

      expect(res.status).toBe(400)
    })
  })

  describe('PUT /api/assets/:id', () => {
    it('should update asset successfully', async () => {
      const asset = await createAsset({ organization_id: org.organization_id })

      const res = await request(app)
        .put(`/api/assets/${asset.asset_id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          asset_name: 'Updated Laptop',
          asset_type: 'device',
          serial_number: asset.serial_number,
        })

      expect(res.status).toBe(200)
      expect(res.body.data.asset_name).toBe('Updated Laptop')
    })

    it('should return 404 if asset not found', async () => {
      const res = await request(app)
        .put('/api/assets/999')
        .set('Authorization', `Bearer ${token}`)
        .send({
          asset_name: 'Updated',
          asset_type: 'device',
          serial_number: 'SN999',
        })

      expect(res.status).toBe(404)
    })

    it('should return 400 if serial number already used by another asset', async () => {
      await createAsset({
        organization_id: org.organization_id,
        serial_number: 'SN001',
      })

      const asset2 = await createAsset({
        organization_id: org.organization_id,
        serial_number: 'SN002',
      })

      const res = await request(app)
        .put(`/api/assets/${asset2.asset_id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          asset_name: 'Updated',
          asset_type: 'device',
          serial_number: 'SN001',
        })

      expect(res.status).toBe(400)
    })
  })

  describe('POST /api/assets/:id/assign', () => {
    let asset

    beforeEach(async () => {
      asset = await createAsset({
        organization_id: org.organization_id,
        asset_status: 'available',
      })
    })

    it('should assign asset successfully', async () => {
      const res = await request(app)
        .post(`/api/assets/${asset.asset_id}/assign`)
        .set('Authorization', `Bearer ${token}`)
        .send({ assigned_user_id: user.user_id })

      expect(res.status).toBe(200)
      expect(res.body.data).toHaveProperty('asset_assignment_id')

      // Verify asset status updated to in-use
      const assetRes = await request(app)
        .get(`/api/assets/${asset.asset_id}`)
        .set('Authorization', `Bearer ${token}`)

      expect(assetRes.body.data.asset_status).toBe('in-use')
    })

    it('should return 400 if asset already assigned', async () => {
      await createAssetAssignment({
        asset_id: asset.asset_id,
        assigned_user_id: user.user_id,
        is_active: 1,
      })

      const res = await request(app)
        .post(`/api/assets/${asset.asset_id}/assign`)
        .set('Authorization', `Bearer ${token}`)
        .send({ assigned_user_id: user.user_id })

      expect(res.status).toBe(400)
      expect(res.body.message).toMatch(/unassign/i)
    })

    it('should return 400 if asset retired', async () => {
      const asset = await createAsset({
        organization_id: org.organization_id,
        asset_status: 'retired',
      })

      const res = await request(app)
        .post(`/api/assets/${asset.asset_id}/assign`)
        .set('Authorization', `Bearer ${token}`)
        .send({ assigned_user_id: user.user_id })

      expect(res.status).toBe(400)
    })

    it('should return 404 if asset not found', async () => {
      const res = await request(app)
        .post('/api/assets/999/assign')
        .set('Authorization', `Bearer ${token}`)
        .send({ assigned_user_id: user.user_id })

      expect(res.status).toBe(404)
    })

    it('should return 400 if assigned user from different organization', async () => {
      const otherOrg = await createOrganization({
        organization_name: 'Other Org',
      })
      const asset = await createAsset({
        organization_id: otherOrg.organization_id,
        asset_status: 'available',
      })

      const res = await request(app)
        .post(`/api/assets/${asset.asset_id}/assign`)
        .set('Authorization', `Bearer ${token}`)
        .send({ assigned_user_id: user.user_id })

      expect(res.status).toBe(400)
      expect(res.body.message).toMatch(/access/i)
    })

    it('should prevent double assignment', async () => {
      const otherOrg = await createOrganization({
        organization_name: 'Other Org',
      })
      const otherUser = await createUser({
        organization_id: otherOrg.organization_id,
        email: 'testother@example.com',
      })

      const asset = await createAsset({
        organization_id: user.organization_id,
        asset_status: 'available',
      })

      const req1 = request(app)
        .post(`/api/assets/${asset.asset_id}/assign`)
        .set('Authorization', `Bearer ${token}`)
        .send({ assigned_user_id: user.user_id })

      const req2 = request(app)
        .post(`/api/assets/${asset.asset_id}/assign`)
        .set('Authorization', `Bearer ${token}`)
        .send({ assigned_user_id: otherUser.user_id })

      const [res1, res2] = await Promise.all([req1, req2])

      const statuses = [res1.status, res2.status]

      expect(statuses).toContain(200)
      expect(statuses).toContain(400)

      const assignments = await getAssetAssignment(asset.asset_id)
      expect(assignments.length).toBe(1)
    })
  })

  describe('POST /api/assets/:id/unassign', () => {
    let asset

    beforeEach(async () => {
      asset = await createAsset({
        organization_id: org.organization_id,
        asset_status: 'available',
      })
    })

    it('should unassign asset successfully', async () => {
      await createAssetAssignment({
        asset_id: asset.asset_id,
        assigned_user_id: user.user_id,
        is_active: 1,
      })

      const res = await request(app)
        .post(`/api/assets/${asset.asset_id}/unassign`)
        .set('Authorization', `Bearer ${token}`)

      expect(res.status).toBe(200)

      // Verify asset status back to available
      const assetRes = await request(app)
        .get(`/api/assets/${asset.asset_id}`)
        .set('Authorization', `Bearer ${token}`)

      expect(assetRes.body.data.asset_status).toBe('available')
    })

    it('should return 400 if asset not assigned', async () => {
      const res = await request(app)
        .post(`/api/assets/${asset.asset_id}/unassign`)
        .set('Authorization', `Bearer ${token}`)

      expect(res.status).toBe(400)
    })

    it('should return 404 if asset not found', async () => {
      const res = await request(app)
        .post('/api/assets/999/unassign')
        .set('Authorization', `Bearer ${token}`)

      expect(res.status).toBe(404)
    })
  })

  describe('GET /api/assets/:id/history', () => {
    let asset

    beforeEach(async () => {
      asset = await createAsset({
        organization_id: org.organization_id,
        asset_status: 'available',
      })
    })

    it('should return assignment history', async () => {
      await createAssetAssignment({
        asset_id: asset.asset_id,
        assigned_user_id: user.user_id,
        is_active: 0,
      })
      await createAssetAssignment({
        asset_id: asset.asset_id,
        assigned_user_id: user.user_id,
        is_active: 1,
      })

      const res = await request(app)
        .get(`/api/assets/${asset.asset_id}/history`)
        .set('Authorization', `Bearer ${token}`)
        .query({ page: 1, limit: 10 })

      expect(res.status).toBe(200)
      expect(res.body.data.list).toHaveLength(2)
      expect(res.body.data.pagination).toHaveProperty('total', 2)
    })

    it('should return empty list if no history', async () => {
      const res = await request(app)
        .get(`/api/assets/${asset.asset_id}/history`)
        .set('Authorization', `Bearer ${token}`)

      expect(res.status).toBe(200)
      expect(res.body.data.list).toHaveLength(0)
    })

    it('should return 404 if asset not found', async () => {
      const res = await request(app)
        .get('/api/assets/999/history')
        .set('Authorization', `Bearer ${token}`)

      expect(res.status).toBe(404)
    })
  })
})
