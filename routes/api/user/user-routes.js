const express = require('express');

const authenticate = require('../../../middlewares/authenticate');
const isValidId = require('../../../middlewares/isValidId');
const upload = require('../../../utils/upload');
const validateBody = require('../../../utils/validateBody');


const { removeUser, updateUserData, changeUserEmailRequest, verifyNewEmail, changePassword, addReview } = require('../../../controllers/users');
const { updateSchema, changePasswordSchema } = require('../../../db/models/users');
const { addReviewSchema } = require('../../../db/models/reviews');

const router = express.Router();

router.delete('/:id', authenticate, isValidId, removeUser);
router.patch('/:id', authenticate, isValidId, upload.single('avatarURL'), validateBody(updateSchema), updateUserData);
router.post('/reviews/:id', authenticate, isValidId, validateBody(addReviewSchema), addReview);
router.post('/email', authenticate, changeUserEmailRequest);
router.get('/verify/:verificationToken', verifyNewEmail);
router.patch('/user/change-password', authenticate, validateBody(changePasswordSchema), changePassword);

module.exports = router;