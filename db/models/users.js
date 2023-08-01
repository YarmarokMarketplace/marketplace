const { Schema, model } = require("mongoose");
const Joi = require("joi");

const handleMongooseError = require('../../utils/handleMongooseError');

const emailRegex = /@([\w-]+\.)+[\w-]{2,4}$/

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
        require: true,
    },
    favorite: [{ type: Schema.Types.ObjectId, ref: "notice" }],
    name: {
        type: String,
        default: "",
    },
    phone: {
        type: String,
        default: "",
    },
    city: {
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
        required: [true, 'Verify token is required'],
    }, 
},
{ versionKey: false, timestamps: true }
);

userSchema.post("save", handleMongooseError);

const registerSchema = Joi.object({
    email: Joi.string().required(),
    password: Joi.string().min(8).required(),
});

const loginSchema = Joi.object({
    email: Joi.string().required(),
    password: Joi.string().min(8).required(),
});

const User = model("user", userSchema);

module.exports = {
    User,
    registerSchema,
    loginSchema,
};