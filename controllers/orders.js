const { Notice } = require("../db/models/notices");
const { Order } = require("../db/models/orders");
const { User } = require("../db/models/users");
const HttpError = require("../helpers/httpError");
const controllerWrapper = require("../utils/controllerWrapper");

const createOrder = async (req, res) => {
    const { _id: owner } = req.user;
    const { id: product } = req.params;

    const deliveryDataForTheNextPurchase = {
        deliveryType: req.body.deliveryType,
        deliveryData: req.body.deliveryData,
    };

    console.log()

    const result = await Order.create({...req.body, owner, product});
    const user = await User.findByIdAndUpdate(owner, deliveryDataForTheNextPurchase);

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
};

const getUserIBuyNotices = async (req, res) => {
    const { _id } = req.user;
    const { page = 1, limit = 3 } = req.query;
    const skip = (page - 1) * limit;

    const result = await User.findById({_id}, 
        "-_id -email -password -avatarURL -name -lastname -patronymic -phone -accessToken -refreshToken -verify -verificationToken -deliveryType -deliveryData -createdAt -updatedAt")
        .populate({
        path: 'favorite',
        options: {
        skip,
        limit: Number(limit)
    },
})

    if (result.favorite.length === 0) {
        throw HttpError.NotFoundError('There any notices for this user');
    };

    const user = await User.findById({_id});
    const totalResult = user.favorite.length; 
    const totalPages = Math.ceil(totalResult / limit);

    res.status(200).json({
        totalResult,
        totalPages,
        page: Number(page),
        limit: Number(limit),
        result,
    });
}

module.exports = {
    createOrder: controllerWrapper(createOrder),
    getOrderById: controllerWrapper(getOrderById),
    getUserIBuyNotices: controllerWrapper(getUserIBuyNotices),
};