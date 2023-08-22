const express = require('express');

const validateBody = require('../../../utils/validateBody');
const authenticate = require('../../../middlewares/authenticate');
const googlePassport = require('../../../middlewares/google-authenticate');
const facebookPassport = require('../../../middlewares/facebook-authenticate');

const { signup, verifyEmail, resendVerifyEmail, login, refresh, logout, getCurrent, googleAuth, facebookAuth} = require('../../../controllers/auth');
const { registerSchema, emailSchema, loginSchema } = require('../../../db/models/users');
const { slowLimiter, longLimiter, createAccountLimiter } = require ('../../../middlewares/limiters');

const router = express.Router();

router.get("/google", googlePassport.authenticate("google", {scope: ["email profile"]}));
router.get("/google/callback", googlePassport.authenticate("google", {session: false}), googleAuth)

router.get("/facebook", facebookPassport.authenticate("facebook", {scope: "email"}));
router.get("/facebook/callback", facebookPassport.authenticate("facebook", {session: false}), facebookAuth)

router.post('/signup', createAccountLimiter, validateBody(registerSchema), signup);
router.get('/verify/:verificationToken', verifyEmail);
router.post('/verify', validateBody(emailSchema), resendVerifyEmail);
router.post('/login', slowLimiter, longLimiter, validateBody(loginSchema), login);
router.post('/refresh', refresh);
router.get('/current', authenticate, getCurrent);
router.post('/logout', authenticate, logout);

module.exports = router;