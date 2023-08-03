const express = require('express');

const validateBody = require('../../../utils/validateBody');

const { signup, verifyEmail, resendVerifyEmail} = require('../../../controllers/auth');
const { registerSchema, emailSchema } = require('../../../db/models/users');

const router = express.Router();

router.post('/signup', validateBody(registerSchema), signup);
router.get('/verify/:verificationToken', verifyEmail);
router.post('/verify', validateBody(emailSchema), resendVerifyEmail);

module.exports = router;