const mongoose = require('mongoose')
const bcrypt = require('bcrypt')


const drop = () => new Promise(resolve => mongoose.connection.db.dropDatabase(resolve))

const requireModels = () => Promise.all(Object.keys(mongoose.models)
  .map(i => mongoose.models[i].ensureIndexes()))

const createUsers = async () => {
  const users = [
    { email: 'stevejobs@apple.com', password: await bcrypt.hash('stayhungry', 8) },
    { email: 'alberteinstein@relativity.emc2', password: await bcrypt.hash('stayfoolish', 8) },
    { email: 'richardfeynman@diagram.edu', password: await bcrypt.hash('I a universe of atoms, an atom in the universe', 8) },
  ]

  await Promise.all(users.map(user => (new mongoose.models.User(user)).save()))
}


module.exports = async () => {
  try {
    await drop()
    await requireModels()
    await createUsers()
  } catch (err) {
    mongoose.disconnect()
    process.exit(err ? 255 : 0)
  }
}
