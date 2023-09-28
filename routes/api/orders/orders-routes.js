require("dotenv").config();

const express = require('express');
const authenticate = require('../../../middlewares/authenticate');
const isValidId = require('../../../middlewares/isValidId');

const { getOrderById, getUserIBuyNotices } = require('../../../controllers/orders');

const router = express.Router();

router.get('/:id', authenticate, isValidId, getOrderById);
router.get('/user/buy', authenticate, getUserIBuyNotices);

module.exports = router;