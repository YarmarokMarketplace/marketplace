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

module.exports = {
    removeUser: controllerWrapper(removeUser),
};