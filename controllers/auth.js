const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const tokens = require('../helpers/tokens')

const User = require('../model/user')
const Refresh = require('../model/refresh')


const signup = async (req, res) => {
  const { email, password } = req.body
  try {
    const user = await User.findOne({ email })
    if (user) return res.status(400).json({ message: 'Such user exist!'})
    const hashed = await bcrypt.hash(password, 8)
    res.json(await new User({ email, password: hashed }).save())
  } catch (e) {
    res.status(500).json(e)
  }
}

const signin = async (req, res) => {
  const { email, password } = req.body
  try {
    const user = await User.findOne({ email })
    if (!user) return res.status(403).json({ message: 'User does not exist!'})

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) return res.status(403).json({ message: 'Password is invalid!' })
    res.json(await tokens.pair({ uid: user._id }))
  } catch (e) {
    res.status(500).json(e)
  }
}

const signout = async (req, res) => {
  await tokens.refresh.remove({ value: req.body.refresh })
  res.json({ message: 'Successfully signed out!'})
}

const refresh = async (req, res) => {
  const { value } = req.body
  try {
    tokens.refresh.verify(value)
    const item = await Refresh.findOne({ value })
    if (!item) return res.status(404).json({ message: 'Invalid refresh token!' })
    res.json(await tokens.pair({ uid: item.uid, value }))
  } catch (e) {
    if (e instanceof jwt.TokenExpiredError) return res.status(404).json({ message: 'Refresh token expired!' })
    if (e instanceof jwt.JsonWebTokenError) return res.status(404).json({ message: 'Invalid refresh token!' })
    res.status(500).json({ message: e.message }) 
  }
}


module.exports = {
  signup,
  signin,
  signout,
  refresh,
}
