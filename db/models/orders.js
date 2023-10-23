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

const NewPost = model('NewPost', new Schema({ name: String }));
const UkrPost = model('UkrPost', new Schema({
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
}));
const Other = model('Other', new Schema({ typeOfOtherDelivery: {
    type: String,
    required: true,
}, }));


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
        default: "",
    },
    buyerPhone: {
        type: String,
        required: true,
    },
    deliveryType: {
        type: String,
        enum: ["new-post", "ukr-post", "other"],
        required: true,
    },
    deliveryData: {
        type: Schema.Types.Object,
        required: true,
    },

    // deliveryData: {
    //     type: Schema.Types.Object,
    //     required: true,
    //     refPath: 'deliveryModel'
    // },
    // deliveryModel: {
    //     type: String,
    //     required: true,
    //     enum: ['NewPost', 'UkrPost', 'Other']
    // },
    comments: {
        type: String,
        required: false,
        default: "",
    },
    saveData: {
        type: Boolean,
        required: false,
        default: false,
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'user',
    },
    product: {
        type: Schema.Types.ObjectId,
        ref: 'notice',
    },
    status: {
        type: String,
        enum: ["await-confirm", "await-delivery", "cancelled-by-seller", "received"],
        default: "await-confirm",
    },
},
{ versionKey: false, timestamps: true });


orderSchema.post("save", handleMongooseError);
const Order = model("order", orderSchema);

module.exports = {
    Order,
};