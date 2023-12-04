const { Schema, model } = require("mongoose");
const Joi = require("joi");
const { DB_HOST } = process.env;
const mongoose = require("mongoose")

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
      type: Number,
      required: true,
    },
    contactName: {
      type: String,
      required: true,
    },
    contactNumber: {
      type: String,
      required: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
    deleted: {
      type: Boolean,
      default: false,
    },
    views: {
      type: Number,
      default: 0,
    },
    reviews: [{ type: Schema.Types.ObjectId, ref: 'review'} ],
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'user',
    },
    onModel: {
      type: String,
      enum: ["notice", "inactivenotice", "deletednotice"],
      default: "notice",
    }
  },
  { versionKey: false, timestamps: true }
);

noticeSchema.post("save", handleMongooseError);

const addNoticeSchema = Joi.object({
  category: Joi.string().required().messages({
    "any.required": `"category" is required`,
    }),
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
  price: Joi.number()
    .required().messages({
    "any.required": "Enter good's price",
    })
  ,
  photos: Joi.array(),
  contactName: Joi.string()
  .required().messages({
  "any.required": "Enter the contact name",
  })
,
  contactNumber: Joi.string()
  .required().messages({
  "any.required": "Enter the contact number",
}),
});

const updateNoticeSchema = Joi.object({
  category: Joi.string(),
  goodtype: Joi.string(),
  title: Joi.string(),
  photos: Joi.array(),
  description: Joi.string(),
  location: Joi.string(),
  price: Joi.number(),
  comments: Joi.string(),
  contactName: Joi.string(),
  contactNumber: Joi.string(),
});

const toggleActiveSchema = Joi.object({
  active: Joi.boolean().required(),
});


const Notice = model("notice", noticeSchema);
const InactiveNotice = model("inactivenotice", noticeSchema);
const DeletedNotice = model("deletednotice", noticeSchema);

module.exports = {
  Notice,
  InactiveNotice,
  DeletedNotice,
  addNoticeSchema,
  updateNoticeSchema,
  toggleActiveSchema
};