const rateLimit = require('express-rate-limit')
const { logEvents } = require('./logger')

const loginLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 10, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again in 10 minutes',
    handler: (req, res, next, options) => {
        logEvents(`${req.ip}\t ${options.message.message}\t${req.url} tried to login too many times`, 'loginLimiter.log')
        res.status(options.statusCode).send(options.message)
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    
})
module.exports = loginLimiter 