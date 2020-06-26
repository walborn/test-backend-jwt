const mongoose = require ('mongoose')
const config = require('./config')
const app = require('./app')
const setup = require('./setup')


mongoose
  .connect(config.mongo.uri, config.mongo.settings)
  .then(setup)
  .then(() => app.listen(config.port))
