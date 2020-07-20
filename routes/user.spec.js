const mongoose = require('mongoose')
const supertest = require('supertest')
const tokens = require('../helpers/tokens')
const app = require('../app')
const User = require('../model/user')
const { mongo } = require('../config')


describe('User routes:', () => {

  let server, request
  beforeAll(async () => {
    await mongoose.connect('mongodb://127.0.0.1/routes__user', mongo.settings)
    server = app.listen(3002)
    request = supertest(server)
  })
  beforeEach(async () => {
    await User.deleteMany({})
  })

  afterAll(async done => {
    await User.deleteMany()
    await mongoose.connection.close()
    server.close(done)
  })

  it('get user list', async () => {
    await request
      .get('/user/list')
      .set('Authorization', `Bearer ${tokens.access.create({ uid: 'alberteinstein' })}`)
      .expect(200)
  })

  it('get user by valid id', async () => {
    const user = new User({ email: 'stevejobs@apple.com', password: 'StayHungryStayFoolish' })
    const { _id: uid } = await user.save()

    await request
      .get(`/user/item/${uid}`)
      .set('Authorization', `Bearer ${tokens.access.create({ uid })}`)
      .expect(200)
  })

  it('get user by invalid id', async () => {
    const user = new User({ email: 'stevejobs@apple.com', password: 'StayHungryStayFoolish' })
    const { _id: uid } = await user.save()
  
    await request
      .get(`/user/item/${mongoose.Types.ObjectId()}`)
      .set('Authorization', `Bearer ${tokens.access.create({ uid })}`)
      .expect(404)
  })
})