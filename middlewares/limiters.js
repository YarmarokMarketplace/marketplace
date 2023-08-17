const rateLimit = require('express-rate-limit');

const slowLimiter = rateLimit({
	windowMs: 1 * 60 * 1000, // 1 minute
	max: 3, // Limit each IP to 3 requests per 'window'
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
	statusCode: 429,
	message: {
		status: 429,
		errorMessage: "Too many requests, please try again in 1 minute"
	   },
});

const longLimiter = rateLimit({
	windowMs: 24 * 60 * 60 * 1000, // 24 hours
	max: 100, // Limit each IP to 3 requests per 'window'
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
	statusCode: 429,
	message: {
		status: 429,
		errorMessage: "Too many requests, please try again in 24 hours"
	   },
});

module.exports = {
    slowLimiter,
    longLimiter,
}