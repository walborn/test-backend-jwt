const jwt = require('express-jwt')
const { secret } = require('../config').jwt


module.exports = [
  jwt({ secret }),
  (err, req, res, next) => {
    if (err.name === 'UnauthorizedError') res.status(err.status).send(err)
    next()
  }
]