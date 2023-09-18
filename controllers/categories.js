const { Category } = require("../db/models/categories");
const HttpError = require("../helpers/httpError");
const controllerWrapper = require("../utils/controllerWrapper");

const getAllCategories = async (req, res) => {
  
  const result = await Category.find({});
  if (result.length === 0) {
    throw HttpError.NotFoundError("Categories not found");
  }
  res.status(200).json({
    result,
  });
};

const addCategory = async (req, res) => {
  uploaded = req.file;
  await Category.create({...req.body, photo: uploaded});
  res.status(200).json({
    message: "ok",
  });
}

module.exports = {
  getAllCategories: controllerWrapper(getAllCategories),
  addCategory: controllerWrapper(addCategory),
};