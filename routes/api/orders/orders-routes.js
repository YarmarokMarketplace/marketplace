require("dotenv").config();

const express = require('express');
const authenticate = require('../../../middlewares/authenticate');
const isValidId = require('../../../middlewares/isValidId');

const { getOrderById, getUserIBuyNotices, getUserISellNotices, changeStatus } = require('../../../controllers/orders');

const router = express.Router();

router.get('/:id', authenticate, isValidId, getOrderById);
router.get('/user/buy', authenticate, getUserIBuyNotices);
router.get('/user/sell', authenticate, getUserISellNotices);
router.patch('/status/:id/', authenticate, isValidId, changeStatus);

module.exports = router;