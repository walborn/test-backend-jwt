const User = require('../model/user')


const fetchList = async (req, res) => {
  try {
    res.json(await User.find())
  } catch (e) {
    res.status(500).json(e)
  }
}

const fetchItem = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
    if (!user) return res.status(404).json({ message: 'User not found!'})
    res.json(user)
  } catch (e) {
    res.status(500).json(e)
  }
}

const fetchMe = async (req, res) => {
  try {
    const me = await User.findById(req.user.uid)
    if (!me) return res.status(404).json({ message: 'User not found!'})
    res.json(me)
  } catch (e) {
    res.status(500).json(e)
  }
}

const createItem = async (req, res) => {
  try {
    res.json(await User.create(req.body))
  } catch (e) {
    res.status(500).json(e)
  }
}

const updateItem = async (req, res) => {
  try {
    res.json(await User.findByIdAndUpdate(req.params.id, req.body, { new: true }))
  } catch (e) {
    res.status(500).json(e)
  }
}

const deleteItem = async (req, res) => {
  try {
    res.json(await User.findByIdAndRemove(req.params.id))
  } catch (e) {
    res.status(500).json(e)
  }
}


module.exports = {
  fetchList,
  fetchItem,
  fetchMe,
  createItem,
  updateItem,
  deleteItem,
}
