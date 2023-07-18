const { Schema, model } = require("mongoose");
const Joi = require("joi");

const handleMongooseError = require("../../utils/handleMongooseError");

const noticeSchema = new Schema(
  {
    category: {
      type: String,
      required: true,
          enum: ["auto", "business-and-services", "for-free", "children's-world", "home-and-garden", "help",
              "electronics", "spare-parts-for-transport", "fashion-and-style", "realty", "exchange",
          "repair", "work", "animals", "goods-to-win", "hobbies-recreation-sports"],
    },
    goodtype: {
      type: String,
          enum: ["new", "used"],
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    photos: {
      type: [String],
      required: false,
    },
    location: {
      type: String,
      required: true,
    },
    price: {
      type: String,
      required: true,
    },
    comments: {
      type: String,
    },
  },
  { versionKey: false, timestamps: true }
);

noticeSchema.post("save", handleMongooseError);

const addNoticeSchema = Joi.object({
  category: Joi.string(),
  goodtype: Joi.string(),
  title: Joi.string()
    .required().messages({
    "any.required": `"title" is required`,
    })
  ,
  description: Joi.string()
    .required().messages({
    "any.required": `"description" is required`,
    })
  ,
  location: Joi.string()
    .required().messages({
    "any.required": "Enter good's location",
    })
  ,
  price: Joi.string()
    .messages({
    "any.required": "Enter good's price and currency",
    })
  ,
  comments: Joi.string(),
});


const Notice = model("notice", noticeSchema);

module.exports = {
  Notice,
  addNoticeSchema,
};