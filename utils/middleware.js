const logger = require('./logger')

const errorHandler = (error, request, response, next) => {
  logger.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  }
  if (error.name === 'MongoServerError' && error.code === 11000) {
    return response.status(400).send({ error: 'Username already taken' })
  }

  next(error)
}

module.exports = {errorHandler}
