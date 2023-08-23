const rateLimit = require('express-rate-limit');

const slowLimiter = rateLimit({
	windowMs: 1 * 60 * 1000, 
	max: 3, 
	standardHeaders: true,
	legacyHeaders: false,
	statusCode: 429,
	message: {
		status: 429,
		message: "Too many requests, please try again in 1 minute"
	},
	handler: function(req, res ) {
        res.status(this.statusCode).json(this.message);
    },
});

const longLimiter = rateLimit({
	windowMs: 24 * 60 * 60 * 1000,
	max: 100,
	standardHeaders: true,
	legacyHeaders: false,
	statusCode: 429,
	message: {
		status: 429,
		message: "Too many requests, please try again in 24 hours"
	},
	handler: function(req, res ) {
        res.status(this.statusCode).json(this.message);
    },
});

const createAccountLimiter = rateLimit({
	windowMs: 24 * 60 * 60 * 1000,
	max: 30,
	standardHeaders: true,
	legacyHeaders: false,
	statusCode: 429,
	message: {
		status: 429,
		message: "Looks like you are a bot, please try again in 24 hours"
	},
	handler: function(req, res ) {
        res.status(this.statusCode).json(this.message);
    },
})

module.exports = {
    slowLimiter,
    longLimiter,
	createAccountLimiter
}