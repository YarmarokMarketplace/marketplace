const jwt = require("jsonwebtoken");
const { User } = require("../db/models/users");
const HttpError = require("../helpers/httpError");
const controllerWrapper = require("../utils/controllerWrapper");
const sendEmail = require('../helpers/sendEmail');
const emailVerificationHtml = require('../utils/verificationEmail');

const { RESET_EMAIL_SECRET_KEY } = process.env;

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

const changeUserEmailRequest = async (req, res) => {
    const { _id } = req.user;
    const { email } = req.body;
    
    const payload = {
        id: _id,
    };

    const verificationToken = jwt.sign(payload, RESET_EMAIL_SECRET_KEY, { expiresIn: 24*60*60 });
    
    const result = await User.findByIdAndUpdate(_id, {newEmail: email, verifyForChangeEmail: false, verificationToken: verificationToken});

    if(!result){
        throw new HttpError(404, "User not found")
    }

    const verificationEmail = {
        to: email,
        subject: "Підтвердження зміни електронної пошти на маркетплейсі Yarmarok",
        html: `${emailVerificationHtml}
        target="_blank" href="https://yarmarok.onrender.com/api/auth/verify/${verificationToken}">Підтвердити</a>
        </div>
        `
    };

    await sendEmail(verificationEmail);

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
            newEmail: result.newEmail
        }
    });
};

const verifyNewEmail = async(req, res)=> {
    const { verificationToken } = req.params;
    const user = await User.findOne({verificationToken});
    console.log(user)
    if(!user){
        throw new HttpError(404, "User not found")
    }
    await User.findByIdAndUpdate(user._id, {email: user.newEmail, verify: false, verifyForChangeEmail: true, verificationToken: "", newEmail: ""});

    res.render('verificationPage');
}

module.exports = {
    removeUser: controllerWrapper(removeUser),
    updateUserData: controllerWrapper(updateUserData),
    changeUserEmailRequest: controllerWrapper(changeUserEmailRequest),
    verifyNewEmail: controllerWrapper(verifyNewEmail),
};