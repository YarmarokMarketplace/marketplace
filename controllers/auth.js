const bcrypt = require('bcrypt');
const { nanoid }= require('nanoid');
const gravatar = require('gravatar');
const controllerWrapper = require('../utils/controllerWrapper');
const { User } = require('../db/models/users');
const HttpError = require('../helpers/httpError');
const sendEmail = require('../helpers/sendEmail');
const { BASE_URL } = process.env;

const signup = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        throw new HttpError(400, "Email and password are required");
    };

    const user = await User.findOne({ email });
    if (user) {
        throw new HttpError(409, "Email in use");
    };

    const hashPassword = await bcrypt.hash(password, 10);
    const avatarURL = gravatar.url(email);
    const verificationToken = nanoid();

    const newUser = await User.create({ ...req.body, password: hashPassword, avatarURL, verificationToken });

    const verifyEmail = {
        to: email,
        subject: "Підтвердження реєстрації на маркетплейсі Yarmarok",
        html: `<div style = 
        "width: 640px;
        padding: 8px;">
        <img style="margin-bottom: 40px;"
        src="https://yarmarok-bucket.s3.eu-central-1.amazonaws.com/logo/logo.png"
        width="240"
        height="36"
        />
        <p style=
        "font-family: 'Roboto', sans-serif;
        font-weight: 500;
        font-size: 14px;
        line-height: 1.14;
        letter-spacing: 0.02em;
        color: black;
        ">
        Для підтвердження реєстраційних даних перейдіть, будь ласка, за посиланням:</p>
        <a style="
        font-family: 'Roboto', sans-serif;
        font-weight: 700;
        font-size: 20px;
        line-height: 1.14;
        letter-spacing: 0.02em;
        "
        target="_blank" href="${BASE_URL}/api/auth/verify/${verificationToken}">Підтвердити</a>
        </div>
        `
    };

    await sendEmail(verifyEmail);

    res.status(201).json({
        status: 'success',
        code: 201,
        user: {
            email: newUser.email,
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

    res.status(200).json({
        status: 'success',
        code: 200,
        message: "Verification is successful"
    })
}

  module.exports = {
    signup: controllerWrapper(signup),
    verifyEmail: controllerWrapper(verifyEmail),
  };