const jwt = require('jsonwebtoken')
const Refresh = require('../model/refresh')
const { secret, token } = require('../config').jwt
let uuid;
try {
  uuid = require('uuid/v4')
} catch {
  uuid = require('uuid').v4
}


const access = {
  create: ({ uid, expiresIn = token.access.exrpireIn }) => jwt.sign({ uid }, secret, { expiresIn }),
}

const refresh = {
  create: ({ uid, expiresIn = token.refresh.exrpireIn }) => jwt.sign({ uid, value: uuid() }, secret, { expiresIn }),
  update: ({ uid, prev, next }) => Refresh
    .findOneAndRemove({ uid, value: prev }).exec()
    .then(() => Refresh.create({ uid, value: next })),
  remove: ({ value }) => Refresh
    .findOneAndRemove({ value }).exec(),
  verify: value => jwt.verify(value, secret)
}

const pair = ({ uid, value }) => refresh
  .update({ uid, prev: value, next: refresh.create({ uid }) })
  .then(({ value }) => ({ access: access.create({ uid }), refresh: value }))


module.exports = { access, refresh, pair }