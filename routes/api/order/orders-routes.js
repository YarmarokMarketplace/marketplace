require("dotenv").config();

const express = require('express');
const authenticate = require('../../../middlewares/authenticate');

const { createOrder } = require('../../../controllers/orders');

const router = express.Router();

router.post('/', authenticate, createOrder);

module.exports = router;