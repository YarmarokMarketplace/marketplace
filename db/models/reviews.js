const { Schema, model } = require("mongoose");
const Joi = require("joi");

const handleMongooseError = require("../../utils/handleMongooseError");

const reviewSchema = new Schema(
  {
    compliance: {
        type: Number,
        enum: [1, 2, 3, 4, 5],
        required: true,
    },
    delivery_speed: {
        type: Number,
        enum: [1, 2, 3, 4, 5],
        required: true,
    },
    communication: {
        type: Number,
        enum: [1, 2, 3, 4, 5],
        required: true,
    },
    averageMark: {
        type: Number,
        default: 0,
    },
    comments: {
        type: String,
    },
    product: {
        type: Schema.Types.ObjectId,
        ref: 'notice',
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'user',
    }
    },
    { versionKey: false, timestamps: true }
);

reviewSchema.post("save", handleMongooseError);

const addReviewSchema = Joi.object({
    compliance: Joi.number(),
    delivery_speed: Joi.number(),
    communication: Joi.number(),
    comments: Joi.string(),
});

const Review = model("review", reviewSchema);

module.exports = {
    Review,
    addReviewSchema,
};