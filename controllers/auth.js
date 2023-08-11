const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const { nanoid }= require('nanoid');
const gravatar = require('gravatar');
const controllerWrapper = require('../utils/controllerWrapper');
const { User } = require('../db/models/users');
const HttpError = require('../helpers/httpError');
const sendEmail = require('../helpers/sendEmail');
const emailVerificationHtml = require('../utils/verificationEmail');

const { BASE_URL, ACCESS_SECRET_KEY, REFRESH_SECRET_KEY } = process.env;

const signup = async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (user) {
        throw new HttpError(409, "Email in use");
    };

    const hashPassword = await bcrypt.hash(password, 10);
    const avatarURL = gravatar.url(email);
    const verificationToken = nanoid();

    const newUser = await User.create({ ...req.body, password: hashPassword, avatarURL, verificationToken });

    const verificationEmail = {
        to: email,
        subject: "Підтвердження реєстрації на маркетплейсі Yarmarok",
        html: `${emailVerificationHtml}
        target="_blank" href="${BASE_URL}/api/auth/verify/${verificationToken}">Підтвердити</a>
        </div>
        `
    };

    await sendEmail(verificationEmail);

    res.status(201).json({
        status: 'success',
        code: 201,
        user: {
            email: newUser.email,
            name: newUser.name,
            lastname: newUser.lastname,
        }
    },);
};

const verifyEmail = async(req, res)=> {
    const {verificationToken} = req.params;
    const user = await User.findOne({verificationToken});
    if(!user){
        throw new HttpError(404, "User not found")
    }
    await User.findByIdAndUpdate(user._id, {verify: true, verificationToken: ""});

    res.render('verificationPage');
}

const resendVerifyEmail = async (req, res) => {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
        throw new HttpError(404, "Email not found");
    }
    if (user.verify) {
        throw new HttpError(400, "Verification has already been passed");
    }

    const verificationEmail = {
        to: email,
        subject: "Підтвердження реєстрації на маркетплейсі Yarmarok",
        html: `${emailVerificationHtml}
        target="_blank" href="${BASE_URL}/api/auth/verify/${user.verificationToken}">Підтвердити</a>
        </div>
        `
    };

    await sendEmail(verificationEmail);

    res.status(200).json({
        status: 'success',
        code: 200,
        message: "Verification email sent"
    })
};

const login = async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
        throw new HttpError(401, "Email or password is wrong");
    };

    if (!user.verify) { 
        throw new HttpError(400, "Email is not verified");
    }

    const passwordCompare = await bcrypt.compare(password, user.password);
    if (!passwordCompare) {
        throw new HttpError(401, "Email or password is wrong");
    }
    const payload = {
        id: user._id,
    };

    const accessToken = jwt.sign(payload, ACCESS_SECRET_KEY, { expiresIn: "15s" });
    const refreshToken = jwt.sign(payload, REFRESH_SECRET_KEY, {expiresIn: "7d"});
    await User.findOneAndUpdate({ _id: payload.id }, { $set: { accessToken, refreshToken } });

    res.status(200).json({
        status: 'success',
        code: 200,
        accessToken,
        refreshToken,
        user: {
            id: user._id,
            email: user.email,
            name: user.name,
        }
    });
};

const logout = async(req, res)=> {
    const { _id } = req.user;
    await User.findByIdAndUpdate(_id, {accessToken: "", refreshToken: ""});
    res.status(200).json({
        message: "Logout success"
    })
};

const getCurrent = (req, res) => {
    const {name, email} = req.user;

    res.status(200).json({
        name,
        email,
    })
}

module.exports = {
    signup: controllerWrapper(signup),
    verifyEmail: controllerWrapper(verifyEmail),
    resendVerifyEmail: controllerWrapper(resendVerifyEmail),
    login: controllerWrapper(login),
    logout: controllerWrapper(logout),
    getCurrent: controllerWrapper(getCurrent),
};