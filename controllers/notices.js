const { Notice, InactiveNotice } = require("../db/models/notices");
const { Category } = require("../db/models/categories");
const { User } = require("../db/models/users");
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

  const { page = 1, limit = 9, goodtype, priceRange, sort, location} = req.query;
  const { category } = req.params;
  const skip = (page - 1) * limit;
  const query = { category, goodtype, priceRange, location };

  const result = await Notice.find(buildFilterObject(query))
  .limit(limit * 1)
  .skip(skip)
  .sort(buildSortObject(sort));
  
    if (result.length === 0) {
      throw HttpError.NotFoundError("Notices not found");
    };

  const name = category;
  const cat = await Category.find({name});

  const isGoodType = cat[0].isGoodType;


  const maxPriceNotice = await Notice.find({category}).sort({"price" : -1}).limit(1)
  const maxPriceInCategory = maxPriceNotice[0].price;

  const totalResult = await Notice.countDocuments(buildFilterObject(query));
  const totalPages = Math.ceil(totalResult / limit);

  res.status(200).json({
      isGoodType,
      totalResult,
      totalPages,
      page: Number(page),
      limit: Number(limit),
      maxPriceInCategory,
      result,
  });
};

const addNotice = async (req, res) => {
  let uploaded = [];
  const { _id: owner } = req.user;
  if (req.files) {
    uploaded = req.files.map(reqfile => reqfile.location);
  }
  
  const result = await Notice.create({...req.body, photos: uploaded, owner});

  res.status(201).json({
    result,
  });  
};

const getNoticeById = async (req, res) => {
  const { id } = req.params;

  const notice = await Notice.findById(id);
  if (!notice) {
    throw HttpError.NotFoundError("Notice not found");
  }
  res.status(201).json({
    data: notice,
   });
};
    
const removeNotice = async (req, res) => {
  const { id } = req.params;

  const result = await Notice.findByIdAndDelete(id);
  if (!result) {
    throw HttpError.NotFoundError("Notice not found");
  }
  res.status(200).json({
    data: {
      message: "Notice deleted",
    }});
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
    throw new HttpError(404, 'Notice not found');
  }
  res.status(201).json({
    status: 'success',
    code: 201,
    result,
   });
};

const toggleActive = async (req, res) => {
  const { id } = req.params;
  const { active } = req.body;
  let result = {};

  if (active === false) {
    result = await Notice.findByIdAndUpdate(id, req.body, { new: true });
  
    if (!result) {
      throw HttpError.NotFoundError("Notice not found");
    }

    await Notice.aggregate([
      { $match: 
          { active: false },
      }, 
      {
          $merge: {
              into: "inactivenotices",
              on: "_id",
              whenMatched: "replace",
              whenNotMatched: "insert"
          }
      }
      ]);

      await Notice.findByIdAndDelete(id);
  } else {
    result = await InactiveNotice.findByIdAndUpdate(id, req.body, { new: true });
  
    if (!result) {
      throw HttpError.NotFoundError("Notice not found");
    }

    await InactiveNotice.aggregate([
      { $match: 
          { active: true},
      }, 
      {
          $merge: {
              into: "notices",
              on: "_id",
              whenMatched: "replace",
              whenNotMatched: "insert"
          }
      }
      ]);

      await InactiveNotice.findByIdAndDelete(id);
  }
  

  res.status(200).json({
    data: {
      message: "Status is changed",
      result,
    }});
};

const checkIsActive = async (req, res) => {
  
  const today = new Date();
  const thirtyDays = today.getTime() - (30*24*60*60*1000);

  await Notice.updateMany({ createdAt: {
    $lt: new Date(thirtyDays)} 
}, { active: false })

await InactiveNotice.updateMany({active: false})
  
  await Notice.aggregate([
    { $match: 
        { createdAt: {
            $lt: new Date(thirtyDays)} 
        }
    }, 
    {
        $merge: {
            into: "inactivenotices",
            on: "_id",
            whenMatched: "replace",
            whenNotMatched: "insert"
        }
    }
    ]);

  await Notice.deleteMany({ createdAt: {
    $lt: new Date(thirtyDays)} 
  });
};

const removeNoticeFromFavorite = async (req, res) => {
  const { _id: userId } = req.user;
  const { id: noticeId } = req.params;

  const user = await User.findById(userId);
  if (!user) {
    throw HttpError.NotFoundError("User not found");
  }
  
  if (!user.favorite.includes(noticeId)) {
    throw HttpError.NotFoundError("Notice not found in favorite notices");
  }

  const result = await User.findByIdAndUpdate(
    userId,
    { $pull: { favorite: noticeId } },
    { new: true }
  );

  res.status(200).json({
    message: "Notice removed",
  });
};

module.exports = {
  getAllNotices: controllerWrapper(getAllNotices),
  getNoticesByCategory: controllerWrapper(getNoticesByCategory),
  addNotice: controllerWrapper(addNotice),
  getNoticeById: controllerWrapper(getNoticeById),
  removeNotice: controllerWrapper(removeNotice),
  updateNotice: controllerWrapper(updateNotice),
  toggleActive: controllerWrapper(toggleActive),
  checkIsActive: controllerWrapper(checkIsActive),
  removeNoticeFromFavorite: controllerWrapper(removeNoticeFromFavorite),
};