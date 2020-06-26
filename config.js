if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config({ debug: process.env.DEBUG })
}

const requireProcessEnv = (name) => {
  if (process.env[name]) return process.env[name]
  throw new Error(`You must set the ${name} environment variable`)
}


module.exports = {
  env: process.env.NODE_ENV || 'development',
  port: requireProcessEnv('PORT'),
  jwt: {
    secret: requireProcessEnv('JWT_SECRET'),
    token: {
      access: {
        exrpireIn: '30s',
      },
      refresh: {
        exrpireIn: '300s',
      }
    },
  },
  mongo: {
    uri: requireProcessEnv('MONGODB_URI'),
    settings:   {
      useCreateIndex: true,
      useUnifiedTopology: true,
      useNewUrlParser: true,
      useFindAndModify: false,
    },
  },
}
