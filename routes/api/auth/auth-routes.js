const express = require('express');

const validateBody = require('../../../utils/validateBody');
const authenticate = require('../../../middlewares/authenticate');

const { signup, verifyEmail, resendVerifyEmail, login, logout, getCurrent} = require('../../../controllers/auth');
const { registerSchema, emailSchema, loginSchema } = require('../../../db/models/users');

const router = express.Router();

router.post('/signup', validateBody(registerSchema), signup);
router.get('/verify/:verificationToken', verifyEmail);
router.post('/verify', validateBody(emailSchema), resendVerifyEmail);
router.post('/login', validateBody(loginSchema), login);
router.get('/current', authenticate, getCurrent);
router.post('/logout', authenticate, logout);

module.exports = router;