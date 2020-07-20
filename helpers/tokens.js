const jwt = require('jsonwebtoken')
const { v4 } = require('uuid')
const Refresh = require('../model/refresh')
const config = require('../config')


const access = {
  create: ({ uid, expiresIn = config.access.exrpireIn }) => jwt.sign({ uid }, config.access.secret, { expiresIn }),
}

const refresh = {
  create: ({ uid, expiresIn = config.refresh.exrpireIn }) => jwt.sign({ uid, value: v4() }, config.refresh.secret, { expiresIn }),
  update: ({ uid, prev, next }) => Refresh
    .findOneAndRemove({ uid, value: prev }).exec()
    .then(() => Refresh.create({ uid, value: next })),
  remove: ({ value }) => Refresh
    .findOneAndRemove({ value }).exec(),
  verify: value => jwt.verify(value, config.refresh.secret)
}

const pair = ({ uid, value }) => refresh
  .update({ uid, prev: value, next: refresh.create({ uid }) })
  .then(({ value }) => ({ access: access.create({ uid }), refresh: value }))


module.exports = { access, refresh, pair }