const { Order } = require("../db/models/orders");
const { User } = require("../db/models/users");
const HttpError = require("../helpers/httpError");
const controllerWrapper = require("../utils/controllerWrapper");

const createOrder = async (req, res) => {
    const { _id: owner } = req.user;
    const { id: product } = req.params;
    const { saveData } = req.body;

    const result = await Order.create({...req.body, owner, product});

    if (saveData) {
        const deliveryDataForTheNextPurchase = {
            deliveryType: req.body.deliveryType,
            deliveryData: req.body.deliveryData,
        };
        const user = await User.findByIdAndUpdate(owner, deliveryDataForTheNextPurchase);
    };

    res.status(201).json({
        result,
    });  
};

const getOrderById = async (req, res) => {
    const { id } = req.params;

    const order = await Order.findById(id)
        .populate("typeOfDelivery")
        .populate("product")
        .populate("owner", "email");

    if (!order) {
        throw HttpError.NotFoundError("Order not found");
    }
    res.status(201).json({
        data: order,
    });
}

module.exports = {
    createOrder: controllerWrapper(createOrder),
    getOrderById: controllerWrapper(getOrderById),
};