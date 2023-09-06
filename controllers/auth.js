const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const { nanoid }= require('nanoid');
const gravatar = require('gravatar');
const controllerWrapper = require('../utils/controllerWrapper');
const { User } = require('../db/models/users');
const HttpError = require('../helpers/httpError');
const sendEmail = require('../helpers/sendEmail');
const emailVerificationHtml = require('../utils/verificationEmail');
const resetPasswordHtml = require('../utils/resetPasswordEmail');

const { BASE_URL, FRONTEND_URL, ACCESS_SECRET_KEY, REFRESH_SECRET_KEY, RESET_PASSWORD_SECRET_KEY } = process.env;

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

const googleAuth = async(req, res)=> {
    const {_id: id} = req.user;
    const payload = {
        id,
    }

    const accessToken = jwt.sign(payload, ACCESS_SECRET_KEY, {expiresIn: "30m"});
    const refreshToken = jwt.sign(payload, REFRESH_SECRET_KEY, {expiresIn: "7d"});
    await User.findByIdAndUpdate(id, {accessToken, refreshToken});

    res.redirect(`${FRONTEND_URL}?accessToken=${accessToken}&refreshToken=${refreshToken}`)
}

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

const forgotPassword = async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({email});
    if(!user){
        throw new HttpError(404, "User not found")
    }

    const payload = {
        id: user._id,
    };

    const resetToken = jwt.sign(payload, RESET_PASSWORD_SECRET_KEY, { expiresIn: 24*60*60 });

    const resetPasswordEmail = {
        to: email,
        subject: "Зміна паролю для входу на маркетплейс Yarmarok",
        html: `${resetPasswordHtml}
        target="_blank" href="${BASE_URL}/api/auth/reset-password/${user._id}/${resetToken}">Змінити пароль</a>
        </div>
        `
    };

    await sendEmail(resetPasswordEmail);

    res.status(200).json({
        status: 'success',
        code: 200,
        message: "Reset password email sent"
    })
};

const resetPassword = async (req, res) => {
    const {id, resetToken} = req.params;
    const {password} = req.body;

    jwt.verify(resetToken, RESET_PASSWORD_SECRET_KEY, function(err, decoded) {
        if (err) {
            throw new HttpError(403, "Reset token is expired")
        }
      });

    const hashPassword = await bcrypt.hash(password, 10);
    await User.findByIdAndUpdate({_id: id},{ password: hashPassword });

    res.status(200).json({
        status: 'success',
        code: 200,
        message: "Reset password is succesful"
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

    const accessToken = jwt.sign(payload, ACCESS_SECRET_KEY, { expiresIn: 300000 });
    const refreshToken = jwt.sign(payload, REFRESH_SECRET_KEY, {expiresIn: 604800});
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

const refresh = async(req, res)=> {
    const { refreshToken: token } = req.body;
    try {
        const { id } = jwt.verify(token, REFRESH_SECRET_KEY);
        const isExist = await User.findOne({refreshToken: token});
        if(!isExist) {
            throw new HttpError(403, "Refresh token is invalid");
        }

        const payload = {
            id,
        }
    
        const accessToken = jwt.sign(payload, ACCESS_SECRET_KEY, {expiresIn: 300});
        const refreshToken = jwt.sign(payload, REFRESH_SECRET_KEY, {expiresIn: 604800});
        await User.findOneAndUpdate({ _id: payload.id }, { $set: { accessToken, refreshToken } });

        res.json({
            accessToken,
            refreshToken,
        })
    }
    catch(error) {
        throw new HttpError(403, error.message);
    }
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
    forgotPassword: controllerWrapper(forgotPassword),
    resetPassword: controllerWrapper(resetPassword),
    login: controllerWrapper(login),
    refresh: controllerWrapper(refresh),
    logout: controllerWrapper(logout),
    getCurrent: controllerWrapper(getCurrent),
    googleAuth: controllerWrapper(googleAuth),
};