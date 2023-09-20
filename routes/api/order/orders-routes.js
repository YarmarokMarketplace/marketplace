require("dotenv").config();

const express = require('express');
const authenticate = require('../../../middlewares/authenticate');
const isValidId = require('../../../middlewares/isValidId');

const { getOrderById, getUserIBuyNotices } = require('../../../controllers/orders');

const router = express.Router();

router.get('/:id', authenticate, isValidId, getOrderById);
router.get('/buy', authenticate, isValidId, getUserIBuyNotices);

module.exports = router;