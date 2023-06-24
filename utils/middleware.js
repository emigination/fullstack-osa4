const jwt = require('jsonwebtoken')
const logger = require('./logger')
const User = require('../models/user')

const errorHandler = (error, request, response, next) => {
  logger.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  }
  if (error.name === 'MongoServerError' && error.code === 11000) {
    return response.status(400).send({ error: 'Username already taken' })
  }
  if (error.name ===  'JsonWebTokenError') {
    return response.status(400).json({ error: 'token missing or invalid' })
  }

  next(error)
}

const tokenExtractor = (request, response, next) => {
  const authorization = request.get('authorization')
  if (authorization && authorization.startsWith('Bearer ')) {
    const extractedToken = authorization.replace('Bearer ', '')
    request.token = extractedToken
  }

  next()
}

const userExtractor = (request, response, next) => {
  if (request.token) {
    const decodedToken = jwt.verify(request.token, process.env.SECRET)
    if (!decodedToken.id || !User.findById(decodedToken.id)) {
      return response.status(401).json({ error: 'token invalid' })
    }

    request.user = decodedToken.id
  }

  next()
}

module.exports = {errorHandler, tokenExtractor, userExtractor}
