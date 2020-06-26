const express = require('express')
const cors = require('cors')
const compression = require('compression')
const bodyParser = require('body-parser')


const app = express()

app.use(cors())
app.use(compression())
app.use(bodyParser.json())
app.use('/auth', require('./routes/auth'))
app.use('/user', require('./routes/user'))


module.exports = app


