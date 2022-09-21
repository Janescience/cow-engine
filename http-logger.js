const morgan = require('morgan')
const json = require('morgan-json')

const format = json({
  method: ':method',
  url: ':url',
  status: ':status',
  responseTime: ':response-time'
})

const httpLogger = morgan(format, {
  stream: {
    write: (message) => {
      const {
        method,
        url,
        status,
        contentLength,
        responseTime
      } = JSON.parse(message)

    }
  }
})

module.exports = httpLogger