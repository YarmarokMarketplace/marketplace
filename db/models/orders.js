const { Schema, model } = require("mongoose");
const handleMongooseError = require("../../utils/handleMongooseError");

const postOfficeSchema = new Schema(
    {
    postOfficeNumber: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
});

const addressSchema = new Schema(
    {
    city: {
        type: String,
        required: true
    },
    street: {
        type: String,
        required: true
    },
    house: {
        type: String,
        required: true
    },
    appartments: {
        type: String,
        required: true
    },
});

const postBoxSchema = new Schema(
    {
    postBoxNumber: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
});

const newPostSchema = new Schema(
    {
    typeOfNovaPostDelivery: {
        type: Object,
        enum: [postOfficeSchema, addressSchema, postBoxSchema],
        required: false
    },
});

const ukrPostSchema = new Schema(
    {
    city: {
        type: String,
        required: true
    },
    index: {
        type: String,
        required: true
    },
    street: {
        type: String,
        required: true
    },
    house: {
        type: String,
        required: true
    },
    appartments: {
        type: String,
        required: true
    },
});

const otherSchema = new Schema(
    {
    typeOfOtherDelivery: {
        type: String,
        required: true,
    },
});

const orderSchema = new Schema(
    {
    buyerName: {
        type: String,
        required: true,
    },
    buyerLastname: {
        type: String,
        required: true,
    },
    buyerPatronymic: {
        type: String,
        required: false,
    },
    buyerPhone: {
        type: String,
        required: true,
    },
    typeOfDelivery: {
        type: String,
        enum: ["new-post", "ukr-post", "other"],
        required: true,
    },
    deliveryData: {
        type: Object,
        enum: [newPostSchema, ukrPostSchema, otherSchema],
        required: true,
    },
    comments: {
        type: String,
        required: false,
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'user',
    }
},
{ versionKey: false, timestamps: true });


orderSchema.post("save", handleMongooseError);
const Order = model("order", orderSchema);

module.exports = {
    Order,
};