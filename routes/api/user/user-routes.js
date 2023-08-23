const express = require('express');

const authenticate = require('../../../middlewares/authenticate');
const isValidId = require('../../../middlewares/isValidId');

const { removeUser} = require('../../../controllers/users');

const router = express.Router();

router.delete('/:id', authenticate, isValidId, removeUser);

module.exports = router;