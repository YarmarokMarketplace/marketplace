const jwt = require("jsonwebtoken");
const bcrypt = require('bcrypt');
const { User } = require("../db/models/users");
const { Notice } = require("../db/models/notices");
const { Review } = require("../db/models/reviews");
const HttpError = require("../helpers/httpError");
const controllerWrapper = require("../utils/controllerWrapper");
const sendEmail = require('../helpers/sendEmail');
const emailVerificationHtml = require('../utils/verificationEmail');

const { RESET_EMAIL_SECRET_KEY, BASE_URL } = process.env;

const removeUser = async (req, res) => {
    const { id } = req.params;

    await Notice.deleteMany({ owner: id })
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

const addReview = async (req, res) => {
    const { _id: owner } = req.user;
    const { id: product } = req.params;
    const { compliance, delivery_speed, communication } = req.body;

    const notice = await Notice.findById(product).populate("reviews");
    if (!notice) {
        throw HttpError.NotFoundError("Notice not found");
    }

    const averageMark = ((compliance + delivery_speed + communication) / 3).toFixed(2);
    const review = await Review.create({...req.body, averageMark: averageMark, owner, product});

    const sellerId = notice.owner;
    const seller = await User.findById(sellerId);
    if (!seller) {
        throw HttpError.NotFoundError("Seller not found");
    };

    let rating = 0;
    if (seller.rating === 0) {
        rating = ((compliance + delivery_speed + communication) / 3).toFixed(2);
    } else {
        const currentRatingSum = notice.reviews.reduce((total, review) => {
            return total + review.averageMark;
        }, 0 );
        rating = ((currentRatingSum + ((compliance + delivery_speed + communication) / 3))/ (notice.reviews.length + 1)).toFixed(2);
    }

    await Notice.findByIdAndUpdate(product, {
        $addToSet: { reviews: review._id }, 
    }, { new: true });

    await User.findByIdAndUpdate(sellerId, {rating: rating, $addToSet: { reviews: review._id }}, { new: true });

    res.status(201).json({
        review,
    });  
};

const changeUserEmailRequest = async (req, res) => {
    const { _id } = req.user;
    const { email } = req.body;
    
    const payload = {
        id: _id,
    };

    const verificationToken = jwt.sign(payload, RESET_EMAIL_SECRET_KEY, { expiresIn: 24*60*60 });


    const isEmailIsCurrent = await User.find({_id, email:email});
    if (isEmailIsCurrent.length > 0) {
        throw new HttpError(400, "You have entered current email")
    };

    const isEmailExists = await User.find({email: email});
    if (isEmailExists.length > 0) {
        throw new HttpError(400, "This email already exists")
    };

    const result = await User.findByIdAndUpdate(_id, {newEmail: email, verifyForChangeEmail: false, verificationToken: verificationToken}, {new: true});

    if(!result){
        throw new HttpError(404, "User not found")
    };

    const verificationEmail = {
        to: email,
        subject: "Підтвердження зміни електронної пошти на маркетплейсі Yarmarok",
        html: `${emailVerificationHtml}
        target="_blank" href="${BASE_URL}/api/user/verify/${verificationToken}">Підтвердити</a>
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
    if(!user){
        throw new HttpError(404, "User not found")
    }
    await User.findByIdAndUpdate(user._id, {email: user.newEmail, verify: false, verifyForChangeEmail: true, verificationToken: "", newEmail: ""});

    res.render('verificationPage');
};

const changePassword = async (req, res) => {
    const { password, newPassword } = req.body;

    const passwordCompare = await bcrypt.compare(password, req.user.password);
        if (!passwordCompare) { 
            throw new HttpError(404, "Password is wrong");
        }
        const hashPassword = await bcrypt.hash(newPassword, 10);
        const user = await User.findByIdAndUpdate(req.user._id, { password: hashPassword });

        if (!user) { 
        throw new HttpError(404, "User not found");
        }

        res.status(200).json({
        message: "Password changed"
        })
};

module.exports = {
    removeUser: controllerWrapper(removeUser),
    updateUserData: controllerWrapper(updateUserData),
    addReview: controllerWrapper(addReview),
    changePassword: controllerWrapper(changePassword),
    changeUserEmailRequest: controllerWrapper(changeUserEmailRequest),
    verifyNewEmail: controllerWrapper(verifyNewEmail),
}