const mongoose = require('mongoose')
const User = require('./user')
const { mongo } = require('../config')


describe('User model test', () => {
  beforeAll(async () => {
    await mongoose.connect('mongodb://127.0.0.1/routes__auth', mongo.settings)
  })

  beforeEach(async () => {
    await User.deleteMany()
  })

  afterAll(async () => {
    await User.drop()
    await mongoose.connection.close()
  })

  it('has a module', () => {
    expect(User).toBeDefined()
  })

  it('create user', async () => {
    const user = new User({ email: 'created@test.com', password: 'createdtest' })
    const created = await user.save()
    expect(created.email).toBe('created@test.com')
  })

  it('fetch user', async () => {
    const user = new User({ email: 'fetched@test.com', password: 'fetchedtest' })
    const { id } = await user.save()
    console.log(id)
    const fetched = await User.findById(id)
    expect(fetched.email).toBe('fetched@test.com')
  })

  it('fetch not existed user', async () => {
    const notfound = await User.findById(mongoose.Types.ObjectId())
    expect(notfound).toBe(null)
  })

  it('update user', async () => {
    const user = new User({ email: 'updated@test.com', password: 'updatedtest' })
    await user.save()
    user.email = 'test@updated.com'
    const updated = await user.save()
    expect(updated.email).toBe('test@updated.com')
  })
})
