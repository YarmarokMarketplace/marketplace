const jwt = require("jsonwebtoken");

const { User } = require("../db/models/users");

const HttpError = require("../helpers/httpError");

const { ACCESS_SECRET_KEY } = process.env;

const authenticate = async (req, res, next) => {
    const { authorization = "" } = req.headers;
    const [ bearer, token ] = authorization.split(" ");
    if(bearer !== "Bearer") {
        next(new HttpError(401, "Not authorized"))
    }

    try {
        const { id } = jwt.verify(token, ACCESS_SECRET_KEY);
        const user = await User.findById(id);
        if(!user || !user.accessToken) {
            next(new HttpError(401, "User not found"))
        }
        req.user = user;
        next()
    }
    catch {
        next(new HttpError(401))
    }
}

module.exports = authenticate;