const express = require('express');

const validateBody = require('../../../utils/validateBody');
const authenticate = require('../../../middlewares/authenticate');

const { signup, verifyEmail, resendVerifyEmail, login, refresh, logout, getCurrent, forgotPassword, resetPassword} = require('../../../controllers/auth');
const { registerSchema, emailSchema, loginSchema } = require('../../../db/models/users');
const { slowLimiter, longLimiter, createAccountLimiter } = require ('../../../middlewares/limiters');

const router = express.Router();


router.post('/signup', createAccountLimiter, validateBody(registerSchema), signup);
router.get('/verify/:verificationToken', verifyEmail);
router.post('/verify', validateBody(emailSchema), resendVerifyEmail);
router.post('/forgot-password', validateBody(emailSchema), forgotPassword);
router.post('/reset-password/:id/:resetToken', resetPassword);
router.post('/login', slowLimiter, longLimiter, validateBody(loginSchema), login);
router.post('/refresh', refresh);
router.get('/current', authenticate, getCurrent);
router.post('/logout', authenticate, logout);

module.exports = router;