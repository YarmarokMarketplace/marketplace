const { User } = require("../db/models/users");
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

module.exports = {
    removeUser: controllerWrapper(removeUser),
    updateUserData: controllerWrapper(updateUserData),
};