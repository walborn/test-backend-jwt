const mongoose = require('mongoose')
const Refresh = require('./refresh')
const { mongo } = require('../config')


describe('Refresh model test', () => {

  beforeAll(async () => {
    await mongoose.connect('mongodb://127.0.0.1/routes__auth', mongo.settings)
  })

  beforeEach(async () => {
    await Refresh.deleteMany()
  })

  afterAll(async () => {
    await Refresh.drop() 
    await mongoose.connection.close()
  })

  it('has a module', () => {
    expect(Refresh).toBeDefined()
  })

  it('create', async () => {
    const refresh = new Refresh({ uid: 'test', value: 'created refresh token' })
    const created = await refresh.save()
    expect(created.value).toBe('created refresh token')
  })

  it('update', async () => {
    const refresh = new Refresh({ uid: 'test', value: 'Read to refresh your mind' })
    await refresh.save()
    const created = await Refresh.findOne({ value: 'Read to refresh your mind'})
    created.value = 'Write to refresh your mind'
    const updated = await created.save()
    expect(updated.value).toBe('Write to refresh your mind')
  })
})
