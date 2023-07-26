const { Schema, model } = require("mongoose");

const handleMongooseError = require("../../utils/handleMongooseError");

const categorySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
          enum: ["auto", "business-and-services", "for-free", "children's-world", "home-and-garden", "help",
              "electronics", "spare-parts-for-transport", "fashion-and-style", "realty", "exchange",
          "repair", "work", "animals", "goods-to-win", "hobbies-recreation-sports"],
    },
  },
  { versionKey: false, timestamps: true }
);

categorySchema.post("save", handleMongooseError);

const Category = model("category", categorySchema);

module.exports = {
    Category,
};