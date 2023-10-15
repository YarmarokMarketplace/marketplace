const { User } = require("../db/models/users");
const { Notice } = require("../db/models/notices");
const { Review } = require("../db/models/reviews");
const HttpError = require("../helpers/httpError");
const controllerWrapper = require("../utils/controllerWrapper");

const removeUser = async (req, res) => {
    const { id } = req.params;

    const result = await User.findByIdAndDelete(id);
    if (!result) {
        throw HttpError.NotFoundError("User not found");
    }
    res.status(200).json({
        data: {
            message: "User deleted",
        }});
};

const updateUserData = async (req, res) => {
    const { _id } = req.user;
    const userData = req.body;
    let data;
    if (req.file) {
        const uploaded = req.file.location;
        data = { ...userData, avatarURL: uploaded}
    } else {
        data = { ...userData }
    }
    console.log(data)
    
    const result = await User.findByIdAndUpdate(_id, data, { new: true });
    
    if (!result) {
        throw new HttpError(404, 'User not found');
    }
    res.status(201).json({
        status: 'success',
        code: 201,
        user: {
            _id: result.id,
            email: result.email,
            name: result.name,
            lastname: result.lastname,
            patronymic: result.patronymic,
            avatarURL: result.avatarURL,
            phone: result.phone,
        }
    });
};

const addReview = async (req, res) => {
    const { _id: owner } = req.user;
    const { id: product } = req.params;
    const notice = await Notice.findById(product);
    if (!notice) {
        throw HttpError.NotFoundError("Notice not found");
    }

    const review = await Review.create({...req.body, owner, product});

    const result = await Notice.findByIdAndUpdate(product, {
        $addToSet: { reviews: review._id }, 
    }, { new: true });

    res.status(201).json({
        review,
    });  
};

module.exports = {
    removeUser: controllerWrapper(removeUser),
    updateUserData: controllerWrapper(updateUserData),
    addReview: controllerWrapper(addReview),
};