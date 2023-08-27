const app = require('./app')
const http = require('http')
const morgan = require('morgan')
const config = require('./utils/config')
const logger = require('./utils/logger')
const server = http.createServer(app)

morgan.token('data', function (req) { return JSON.stringify(req.body) })
app.use(morgan((tokens, req, res) => {
  return [
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens.res(req, res, 'content-length'), '-',
    tokens['response-time'](req, res), 'ms',
    tokens.data(req, res)
  ].join(' ')
}))

server.listen(config.PORT, () => {
  logger.info(`Server running on port ${config.PORT}`)
})