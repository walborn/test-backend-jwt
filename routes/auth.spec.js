const mongoose = require('mongoose')
const supertest = require('supertest')
const bcrypt = require('bcrypt')
const tokens = require('../helpers/tokens')
const app = require('../app')
const User = require('../model/user')
const Refresh = require('../model/refresh')
const { mongo } = require('../config')


// Test the JWT authentication
describe('Auth routes:', () => {

  let server, request
  beforeAll(async () => {
    await mongoose.connect('mongodb://127.0.0.1/routes__auth', mongo.settings)
    server = app.listen(3001)
    request = supertest(server)
  })

  beforeEach(async () => {
    await User.deleteMany()
    await Refresh.deleteMany()
  })

  afterAll(async done => {
    await User.deleteMany()
    await Refresh.deleteMany()
    await mongoose.connection.close()
    server.close(done)
  })

  // User can successfully sign up
  it('sign up', async () => {
    await request
      .post('/auth/signup')
      .send({ email: 'test@test.com', password: 'IfYouCanNotExplainItToA6YearOldYouDontUnderstandItYourself' })
      .expect(200)

    const user = await User.findOne({ email: 'test@test.com' })
    expect(user.email).toBe('test@test.com')
  })

  // User can successfully sign in
  it('sign in', async () => {
    const password = await bcrypt.hash('WhatOneFoolCanUnderstandAnotherCan', 8)
    const user = new User({ email: 'test@test.com', password })
    await user.save()
  
    const { access, refresh } = (await request
      .post('/auth/signin')
      .send({ email: 'test@test.com', password: 'WhatOneFoolCanUnderstandAnotherCan' })
      .expect(200)).body
    
    expect(typeof access).toBe('string')
    expect(typeof refresh).toBe('string')

    const res = await request
      .post('/auth/refresh')
      .send({ value: refresh })
      .expect(200)

    expect(typeof res.body.access).toBe('string')
    expect(typeof res.body.refresh).toBe('string')
  })


  // User gets 403 on invalid credentials
  it('sign in with invalid credentials', () => request
    .post('/auth/signin')
    .send({ email: 'buddha@gmail.com', password: 'GrowthIsNotFoundInComfort' })
    .expect(403)
  )

  // User receives 401 on expired access token
  it('request with expired token', () => {
    const expired = `Bearer ${tokens.access.create({ uid: 1, expiresIn: '1ms' })}`
    request
      .get('/user/list')
      .set('Authorization', expired)
      .expect(401)
  })

  // User can get new access token using refresh token
  it('get new access token using refresh', async () => {
    const password = await bcrypt.hash('NoPressureNoDiamonds', 8)
    const user = new User({ email: 'test@test.com', password })
    await user.save()
  
    const value = (await request
      .post('/auth/signin')
      .send({ email: 'test@test.com', password: 'NoPressureNoDiamonds' })
      .expect(200)).body.refresh

    const { access, refresh } = (await request
      .post('/auth/refresh')
      .send({ value })
      .expect(200)).body
  
    expect(typeof access).toBe('string')
    expect(typeof refresh).toBe('string')
  })

  // User get 404 on invalid refresh token
  it('with invalid refresh', async () => {
    const invalid = 'TheWorstThingUCanDoToAKidIsTellThemThatTheirDreamsAreInvalid'
    const notExist = tokens.refresh.create({ uid: 'test' })
    const expired = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImJhODgwMzBiLTdiMTctNGZhMS1iNjc2LTg1NjQ3YmI0NmViNSIsImlhdCI6MTU5MjkzODU1MiwiZXhwIjoxNTkyOTM4NTgyfQ._sW0qUbO5WVoE_AXOrg1SCquRXFiKfQwCYV-05qQetc'
    await request
      .post('/auth/refresh')
      .send({ value: invalid })
      .expect(404)
    await request
      .post('/auth/refresh')
      .send({ value: notExist })
      .expect(404)
    await request
      .post('/auth/refresh')
      .send({ value: expired })
      .expect(404)
    
  })

  // User can use refresh token only once
  it('each refresh can be used only once', async () => {
    const password = await bcrypt.hash('StayFoolishToStaySane', 8)
    const user = new User({ email: 'test@test.com', password })
    await user.save()
  
    const value = (await request
      .post('/auth/signin')
      .send({ email: 'test@test.com', password: 'StayFoolishToStaySane' })
      .expect(200)).body.refresh

    await request
      .post('/auth/refresh')
      .send({ value })
      .expect(200)

    await request
      .post('/auth/refresh')
      .send({ value })
      .expect(404)
  })

  // Refresh tokens become invalid on sign out
  it('spoil refresh while sign out', async () => {
    const password = await bcrypt.hash('WhenNothingGoesRightGoLeft', 8)
    const user = new User({ email: 'test@test.com', password })
    await user.save()
  
    const { access, refresh } = (await request
      .post('/auth/signin')
      .send({ email: 'test@test.com', password: 'WhenNothingGoesRightGoLeft' })
      .expect(200)).body

    await request
      .post('/auth/signout')
      .set('Authorization', `Bearer ${access}`)
      .send({ refresh })
      .expect(200)

    await request
      .post('/auth/refresh')
      .send({ value: refresh })
      .expect(404)
  })
  
  // Multiple refresh tokens are valid
  it('multiple refresh', async () => {
    const password = await bcrypt.hash('ProveThemWrong', 8)
    const user = new User({ email: 'test@test.com', password })
    await user.save()

    const refreshes = [
      (
        await request
          .post('/auth/signin')
          .send({ email: 'test@test.com', password: 'ProveThemWrong' })
          .expect(200)
      ).body.refresh,
      (
        await request
          .post('/auth/signin')
          .send({ email: 'test@test.com', password: 'ProveThemWrong' })
          .expect(200)
      ).body.refresh,
    ]

    await request
      .post('/auth/refresh')
      .send({ value: refreshes[0] })
      .expect(200)

    await request
      .post('/auth/refresh')
      .send({ value: refreshes[1] })
      .expect(200)
  })
})