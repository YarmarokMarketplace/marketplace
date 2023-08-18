const express = require('express');

const validateBody = require('../../../utils/validateBody');

const { signup, verifyEmail, resendVerifyEmail, forgotPassword, resetPassword} = require('../../../controllers/auth');
const { registerSchema, emailSchema } = require('../../../db/models/users');

const router = express.Router();

router.post('/signup', validateBody(registerSchema), signup);
router.get('/verify/:verificationToken', verifyEmail);
router.post('/verify', validateBody(emailSchema), resendVerifyEmail);
router.post('/forgot-password', validateBody(emailSchema), forgotPassword);
router.post('/reset-password/:id/:resetToken', resetPassword);

module.exports = router;