const { Order } = require("../db/models/orders");
const { User } = require("../db/models/users");
const { Notice } = require("../db/models/notices");
const HttpError = require("../helpers/httpError");
const controllerWrapper = require("../utils/controllerWrapper");

const createOrder = async (req, res) => {
    const { _id: buyerId } = req.user;
    const { id: product } = req.params;
    const { saveData } = req.body;

    let deliveryDataForTheNextPurchase;
  
  if (saveData) {
        deliveryDataForTheNextPurchase = {
            deliveryType: req.body.deliveryType,
            deliveryData: req.body.deliveryData,
        };
        const user = await User.findByIdAndUpdate(buyerId, deliveryDataForTheNextPurchase);
    };

    const result = await Order.create({...req.body, buyerId, product});
    await User.findByIdAndUpdate(buyerId, deliveryDataForTheNextPurchase);

    const order = await Notice.findById(product);
    const sellerId = order.owner;

    await User.findByIdAndUpdate(sellerId, {
        $addToSet: { sell: result._id }, 
    });

    await User.findByIdAndUpdate(buyerId, {
        $addToSet: { buy: result._id }, 
    });

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
    "-_id -email -password -avatarURL -name -lastname -patronymic -phone -accessToken -refreshToken -sell -favorite -verify -verificationToken -deliveryType -deliveryData -createdAt -updatedAt")
    .populate({
    path: 'buy',
    model: 'order',
    options: {
      skip,
      limit: Number(limit),
      sort: { 'createdAt': -1 }
    },
    populate: {
      path: "product",
      model: "notice",
      populate: {
        path: "owner",
        model: "user",
        select: "-password -accessToken -refreshToken",
      }
    },
  });
  
  if (!result) {
    throw HttpError.NotFoundError('There any buy orders for this user');
  };
  const sortedResult = [...result.buy].sort((firstElem, secondElem) => secondElem.createdAt - firstElem.createdAt)

  const user = await User.findById({_id});
  const totalResult = user.buy.length; 
  const totalPages = Math.ceil(totalResult / limit);
  
  res.status(200).json({
    totalResult,
    totalPages,
    page: Number(page),
    limit: Number(limit),
    result: sortedResult,
  });
};

const getUserISellNotices = async (req, res) => {
  const { _id } = req.user;
  const { page = 1, limit = 3 } = req.query;
  const skip = (page - 1) * limit;

  const result = await User.findById({_id}, 
      "-_id -email -reviews -newEmail -verifyForChangeEmail -rating -password -avatarURL -name -lastname -patronymic -phone -accessToken -refreshToken -buy -favorite -verify -verificationToken -deliveryType -deliveryData -createdAt -updatedAt")
      .populate({
        path: 'sell',
        model: 'order',
        options: {
          skip,
          limit: Number(limit),
          sort: { 'createdAt': -1 }
        },
        populate: {
          path: "product",
          model: "notice",
        },
      });
  
  if (result.sell.length === 0) {
    throw HttpError.NotFoundError('There any sell orders for this user');
  };

  const sortedResult = [...result.sell].sort((firstElem, secondElem) => secondElem.createdAt - firstElem.createdAt)

  const user = await User.findById({_id});
  const totalResult = user.sell.length; 
  const totalPages = Math.ceil(totalResult / limit);
  
  res.status(200).json({
    totalResult,
    totalPages,
    page: Number(page),
    limit: Number(limit),
    result: sortedResult,
    result
  });
};

const changeStatus = async (req, res) => {
    const { id } = req.params;
    const newStatus = req.body;

    const result = await Order.findByIdAndUpdate(id, newStatus, { new: true })
    .populate([{
      path: "product",
      model: "notice",
      populate: {
        path: "owner",
        model: "user",
        select: "-password -accessToken -refreshToken",
      }
    },
    {
      path: "product",
      model: "inactivenotice",
      populate: {
        path: "owner",
        model: "user",
        select: "-password -accessToken -refreshToken",
      }
    },
    {
      path: "product",
      model: "deletednotice",
      populate: {
        path: "owner",
        model: "user",
        select: "-password -accessToken -refreshToken",
      }
    }])
    //.populate("product");
    
    if (!result) {
        throw new HttpError(404, 'Order not found');
    }

    res.status(200).json({
        status: 'success',
        code: 200,
        result,
    });

}


module.exports = {
    createOrder: controllerWrapper(createOrder),
    getOrderById: controllerWrapper(getOrderById),
    getUserIBuyNotices: controllerWrapper(getUserIBuyNotices),
    getUserISellNotices: controllerWrapper(getUserISellNotices),
    changeStatus: controllerWrapper(changeStatus),
};