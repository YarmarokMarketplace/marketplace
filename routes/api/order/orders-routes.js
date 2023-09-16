require("dotenv").config();

const express = require('express');
const authenticate = require('../../../middlewares/authenticate');
const isValidId = require('../../../middlewares/isValidId');

const { getOrderById } = require('../../../controllers/orders');

const router = express.Router();

router.get('/:id', authenticate, isValidId, getOrderById);

module.exports = router;