const { Schema, model } = require("mongoose");
const Joi = require("joi");

const handleMongooseError = require('../../utils/handleMongooseError');

const emailRegex = /@([\w-]+\.)+[\w-]{2,6}$/

const userSchema = new Schema({
    email: {
        type: String,
        match: emailRegex,
        unique: true,
        required: [true, "Email is required"],
    },
    password: {
        type: String,
        minlength: 8,
        required: [true, "Set password for user"],
    },
    avatarURL: {
        type: String,
    },
    favorite: [{ type: Schema.Types.ObjectId, ref: "notice" }],
    name: {
        type: String,
        required: [true, "Name is required"],
    },
    lastname: {
        type: String,
        default: "",
    },
    patronymic: {
        type: String,
        default: "",
    },
    phone: {
        type: String,
        default: "",
    },
    accessToken: {
        type: String,
        default: "",
    },
    refreshToken: {
        type: String,
        default: "",
    },
    verify: {
        type: Boolean,
        default: false,
    },
    verificationToken: {
        type: String,
        default: '',
    },
    deliveryType: {
        type: String,
        enum: ["new-post", "ukr-post", "other", ""],
        default: "",
    },
    deliveryData: {
        type: Schema.Types.Mixed,
        default: "",
    }
},
{ versionKey: false, timestamps: true }
);

userSchema.post("save", handleMongooseError);

const registerSchema = Joi.object({
    email: Joi.string().pattern(emailRegex).required(),
    password: Joi.string().min(8).required(),
    name: Joi.string().required(),
});

const loginSchema = Joi.object({
    email: Joi.string().pattern(emailRegex).required(),
    password: Joi.string().min(8).required(),
});

const emailSchema = Joi.object({
    email: Joi.string().pattern(emailRegex).required(),
});

const updateSchema = Joi.object({
    name: Joi.string(),
    lastname: Joi.string(),
    patronymic: Joi.string(),
    avatarURL: Joi.string(),
    phone: Joi.string(),

});

const User = model("user", userSchema);

module.exports = {
    User,
    registerSchema,
    loginSchema,
    emailSchema,
    updateSchema,
};