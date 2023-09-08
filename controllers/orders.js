const { Order } = require("../db/models/orders");
const { User } = require("../db/models/users");
const HttpError = require("../helpers/httpError");
const controllerWrapper = require("../utils/controllerWrapper");

const createOrder = async (req, res) => {
    const { _id: owner } = req.user;

    const result = await Order.create({...req.body, owner});

    res.status(201).json({
        result,
    });  
};

module.exports = {
    createOrder: controllerWrapper(createOrder),
};