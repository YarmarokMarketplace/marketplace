const { Notice } = require("../db/models/notices");
const HttpError = require("../helpers/httpError");
const controllerWrapper = require("../utils/controllerWrapper");

const buildFilterObject = require("../utils/filterObject");
const buildSortObject = require("../utils/sortObject");

const getAllNotices = async (req, res) => {
  const { page = 1, limit = 9 } = req.query;
  const skip = (page - 1) * limit;

  const result = await Notice.find({}, "", {
    skip,
    limit: Number(limit),
  }).sort({ createdAt: -1 });

  if (result.length === 0) {
    throw HttpError.NotFoundError("Notices not found");
  }

  const totalResult = await Notice.count();
  const totalPages = Math.ceil(totalResult / limit);

  res.status(200).json({
    totalResult,
    totalPages,
    page: Number(page),
    limit: Number(limit),
    result,
  });
};

const getNoticesByCategory = async (req, res) => {

  const { page = 1, limit = 9, goodtype, priceRange, sort} = req.query;
  const { category } = req.params;
  const skip = (page - 1) * limit;
  const query = { category, goodtype, priceRange };

  const result = await Notice.find(buildFilterObject(query))
  .limit(limit * 1)
  .skip(skip)
  .sort(buildSortObject(sort));
  
    if (result.length === 0) {
      throw HttpError.NotFoundError("Notices not found");
    };

  const totalResult = await Notice.countDocuments(buildFilterObject(query));
  const totalPages = Math.ceil(totalResult / limit);

  res.status(200).json({
      totalResult,
      totalPages,
      page: Number(page),
      limit: Number(limit),
      result,
  });
};

const addNotice = async (req, res) => {
  const uploaded = req.files.map(reqfile => reqfile.location);
  const result = await Notice.create({...req.body, photos: uploaded});

  res.status(201).json({
    result,
  });  
};

const updateNotice = async (req, res) => {
  const { id } = req.params;
  const noticeData = req.body;
  let data;
  if (req.files) {
    const uploaded = req.files.map(reqfile => reqfile.location);
    data = { ...noticeData, photos: uploaded}
  } else {
    data = { ...noticeData }
  }
  
  const result = await Notice.findByIdAndUpdate(id, data, { new: true });
  
  if (!result) {
    throw new HttpError(404, 'Project not found');
  }
  res.status(201).json({
    status: 'success',
    code: 201,
    result,
  });
};


module.exports = {
  getAllNotices: controllerWrapper(getAllNotices),
  getNoticesByCategory: controllerWrapper(getNoticesByCategory),
  addNotice: controllerWrapper(addNotice),
  updateNotice: controllerWrapper(updateNotice),
};