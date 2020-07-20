const jwt = require('express-jwt')
const config = require('../config')


module.exports = [
  jwt({ secret: config.access.secret, algorithms: [ 'HS256' ] }),
  (err, req, res, next) => {
    if (err.name === 'UnauthorizedError') res.status(err.status).send(err)
    next()
  }
]