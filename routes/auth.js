const router = require('express').Router()
const auth = require('../controllers/auth')


router.post('/signup', auth.signup)
router.post('/signin', auth.signin)
router.post('/signout', auth.signout)
router.post('/refresh', auth.refresh)


module.exports = router
