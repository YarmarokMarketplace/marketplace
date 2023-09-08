const express = require('express');

const authenticate = require('../../../middlewares/authenticate');
const isValidId = require('../../../middlewares/isValidId');
const upload = require('../../../utils/upload');
const validateBody = require('../../../utils/validateBody');

const { removeUser, updateUserData, sendPurchaseRequest } = require('../../../controllers/users');
const { updateSchema } = require('../../../db/models/users');

const router = express.Router();

router.delete('/:id', authenticate, isValidId, removeUser);
router.patch('/:id', authenticate, isValidId, upload.single('avatarURL'), validateBody(updateSchema), updateUserData);
router.post('/notice/:id', authenticate, isValidId, sendPurchaseRequest);

module.exports = router;