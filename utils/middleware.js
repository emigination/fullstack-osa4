const logger = require('./logger')

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
  request.token = null
  if (authorization && authorization.startsWith('Bearer ')) {
    const extractedToken = authorization.replace('Bearer ', '')
    request.token = extractedToken
  }

  next()
}

module.exports = {errorHandler, tokenExtractor}
