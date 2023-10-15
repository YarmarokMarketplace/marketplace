const express = require('express');

const authenticate = require('../../../middlewares/authenticate');
const isValidId = require('../../../middlewares/isValidId');
const upload = require('../../../utils/upload');
const validateBody = require('../../../utils/validateBody');

const { removeUser, updateUserData, addReview } = require('../../../controllers/users');
const { updateSchema } = require('../../../db/models/users');
const { addReviewSchema } = require('../../../db/models/reviews');

const router = express.Router();

router.delete('/:id', authenticate, isValidId, removeUser);
router.patch('/:id', authenticate, isValidId, upload.single('avatarURL'), validateBody(updateSchema), updateUserData);
router.post('/reviews/:id', authenticate, isValidId, validateBody(addReviewSchema), addReview);

module.exports = router;