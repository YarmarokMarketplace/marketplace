const express = require('express');

const validateBody = require('../../../utils/validateBody');

const { signup, verifyEmail} = require('../../../controllers/auth');
const { registerSchema } = require('../../../db/models/users');

const router = express.Router();

router.post('/signup', validateBody(registerSchema), signup);
router.get('/verify/:verificationToken', verifyEmail);

module.exports = router;