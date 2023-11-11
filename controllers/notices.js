const { Notice, InactiveNotice } = require("../db/models/notices");
const { User } = require("../db/models/users");
const { Category } = require("../db/models/categories");
const { Order } = require("../db/models/orders");
const HttpError = require("../helpers/httpError");
const controllerWrapper = require("../utils/controllerWrapper");
const buildFilterObject = require("../utils/filterObject");
const buildSortObject = require("../utils/sortObject");
const deactivationNotificationHtml = require("../utils/deactivationNotification");
const sendEmail = require('../helpers/sendEmail');
const buildFilterAfterSearchByKeywords = require("../utils/filterAfterSearchByKeywords");
const buildSortObjectAfterSearchByKeywords = require("../utils/sortObjectAfterSearchByKeywords");

const getAllNotices = async (req, res) => {
  const { page = 1, limit = 9 } = req.query;
  const skip = (page - 1) * limit;

  const result = await Notice.find({}, "", {
    skip,
    limit: Number(limit),
  }).populate("owner", "email").sort({ createdAt: -1 });

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

  const { page = 1, limit = 9, goodtype, priceRange, sort, location, minSellerRating } = req.query;
  const { category } = req.params;
  const skip = (page - 1) * limit;
  const query = { category, goodtype, priceRange, location, minSellerRating };

  let result = await Notice.aggregate([
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
      }
    },
    {
      $match : buildFilterObject(query)
    },
    {
      $project: {
        "owner.password": 0,
        "owner.accessToken": 0,
        "owner.refreshToken": 0,
      }
    },
    {
      $skip: skip*1
    }, 
    {
      $limit: limit*1
    }
    ]).sort(buildSortObject(sort))
  
  const resultForTotalResult = await Notice.aggregate([ 
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
      }
    },
    {
      $match : buildFilterObject(query)
    },
  ])
  
  if (result.length === 0) {
      throw HttpError.NotFoundError("Notices not found");
  };

  const totalResult = resultForTotalResult.length;
  const totalPages = Math.ceil(totalResult / limit);

  const name = category;
  const cat = await Category.find({name});
  const isGoodType = cat[0].isGoodType;

  const maxPriceNotice = await Notice.find({category}).sort({"price" : -1}).limit(1)
  const maxPriceInCategory = maxPriceNotice[0].price;

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
  let notice;
  notice = await Notice.findById(id).populate({
    path: 'reviews',
    model: 'review',
  });
  if (!notice) {
    notice = await InactiveNotice.findById(id).populate({
    path: 'reviews',
    model: 'review',
  })
  } if (!notice) throw HttpError.NotFoundError("Notice not found");

  const sellerId = notice.owner;
  const seller = await User.findById(sellerId);
  const sellerRating = seller.rating;

  res.status(200).json({
    notice,
    sellerRating,
  });
};

const removeNotice = async (req, res) => {
  const { id } = req.params;

  const today = new Date();
  const thirtyDays = today.getTime() - (30*24*60*60*1000);

  const awaitDeliveryOrder = await Order.find({product: id, status: 'await-delivery', createdAt: {
    $gt: new Date(thirtyDays)}});

  if (awaitDeliveryOrder.length > 0) {
    throw HttpError.BadRequest("You can't remove this notice due to status 'await-delivery'");
  }

  let result;

  result = await Notice.findByIdAndDelete(id);
  result = await InactiveNotice.findByIdAndDelete(id);
  
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

await InactiveNotice.updateMany({active: false});
  
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

    const inactiveNotices = await Notice.find({ createdAt: {
          $lte: new Date()} 
        }).populate("owner");
      
        const noticesWithActiveUsers = inactiveNotices.filter(notice => notice.owner !== null)
    
  for (i = 0; i < noticesWithActiveUsers.length; i += 1) {
    noticeTitle = noticesWithActiveUsers[i].title;
    email = noticesWithActiveUsers[i].owner.email;
    id = noticesWithActiveUsers[i]._id;
    noticeCategory = noticesWithActiveUsers[i].category;

    const deactivationEmail = {
      to: email,
      subject: "Сповіщення про деактивацію оголошення",
      html: `${deactivationNotificationHtml}
      Шановний користувачу! Повідомляємо про деактивацію вашого оголошення "${noticeTitle}".
      Якщо Ви хочете активувати оголошення, перейдіть, будь ласка, на сторінку оголошення за посиланням:</p>
      <a style="
      font-family: 'Roboto', sans-serif;
      font-weight: 700;
      font-size: 20px;
      line-height: 1.14;
      letter-spacing: 0.02em;"
      target="_blank" href="https://yarmarok.netlify.app/#/${noticeCategory}/${id}">Перейти до оголошення</a>
      </div>
      `
    };
  
      await sendEmail(deactivationEmail);
    }
    await Notice.deleteMany({ createdAt: {
      $lt: new Date(thirtyDays)} 
    });

  res.status(200).json({
    message: 'ok'
      });
};

const getAllUserNotices = async (req, res) => {
  const { _id: owner } = req.user;
  const { page = 1, limit = 3 } = req.query;
  const skip = (page - 1) * limit;
  const activeNotices = await Notice.find({ owner }, "", {
    skip,
    limit,
  }).populate("owner", "email").sort({ createdAt: -1 });

  const inactiveNotices = await InactiveNotice.find({ owner }, "", {
    skip,
    limit,
  }).populate("owner", "email").sort({ createdAt: -1 });

  if (activeNotices.length === 0 && inactiveNotices === 0) {
    throw HttpError.NotFoundError('This user has not any notices');
  };

  const activeResult = await Notice.countDocuments({ owner });
  const inactiveResult = await InactiveNotice.countDocuments({ owner });

  const totalPagesActive = Math.ceil(activeResult / limit);
  const totalPagesInactive = Math.ceil(inactiveResult / limit);

  res.status(200).json({
    totalPagesActive,
    totalPagesInactive,
    activeResult,
    inactiveResult,
    page: Number(page),
    limit: Number(limit),
    activeNotices,
    inactiveNotices,
  });
};

const getFavoriteUserNotices = async (req, res) => {
  const { _id } = req.user;
  let result = [];
  const result1 = await User.findById({_id},
    "-_id -email -password -avatarURL -name -lastname -patronymic -phone -accessToken -refreshToken -verify -verificationToken -deliveryType -deliveryData -buy -sell -createdAt -updatedAt")
    .populate({
    path: 'favorite',
    model: 'notice',
  })

    if (result1.favorite.length === 0) {
      throw HttpError.NotFoundError('There any notices for this user');
    };

    result.push(...result1.favorite);

    const result2 = await User.findById({_id},
      "-_id -email -password -avatarURL -name -lastname -patronymic -phone -accessToken -refreshToken -verify -verificationToken -deliveryType -deliveryData -buy -sell -createdAt -updatedAt")
      .populate({
      path: 'favorite',
      model: 'inactivenotice',
    })

      result.push(...result2.favorite);

  const user = await User.findById({_id});
  // const totalResult = user.favorite.length; 
  // const totalPages = Math.ceil(totalResult / limit);
  
  res.status(200).json({
    // totalResult,
    // totalPages,
    // page: Number(page),
    // limit: Number(limit),
    result,
  });
};

const addNoticeToFavorite = async (req, res) => {
  const { _id: userId } = req.user;
  const { id: noticeId } = req.params;

  const user = await User.findById(userId);
  if (!user) {
    throw HttpError.NotFoundError("User not found");
  }

  const result = await User.findByIdAndUpdate(userId, {
    $addToSet: { favorite: noticeId }, 
  }, { new: true });

  if (!result) {
    throw HttpError.NotFoundError(`Notice with ${noticeId} not found`);
  }

  res.status(200).json({
    user: {
      _id: result._id,
      name: result.name,
      lastname: result.lastname,
      phone: result.phone,
      email: result.email,
      favorite: result.favorite,
    },
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
    favorite: result.favorite
  });
};

const searchNoticesByKeywords = async (req, res) => {
  const { page = 1, limit = 9, keywords = "", goodtype, priceRange, location, sort, category, minSellerRating } = req.query;
  const skip = (page - 1) * limit;
  const query = { goodtype, priceRange, location, category, minSellerRating };
  
  if (!keywords) {
    throw HttpError.BadRequest("The search keywords is empty");
  }

  let notices = await Notice.aggregate([
    { $match: {
      $and: [
          {$text: {$search: keywords}}, 
          buildFilterAfterSearchByKeywords(query)
        ]}
    },
    { $sort: { score: { $meta: "textScore" } } },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
      }
    },
    {
      $project: {
        "owner.password": 0,
        "owner.accessToken": 0,
        "owner.refreshToken": 0,
      }
    },
    {
      $skip: skip*1
    }, 
    {
      $limit: limit*1
    }
    ])

  
  // let notices = await Notice.find(
  //   {$and: [
  //     {$text: {$search: keywords}}, 
  //     buildFilterAfterSearchByKeywords(query)
  //   ]}, 
  //     {score: {$meta: "textScore"}}, {skip, limit: Number(limit)}).sort({score:{$meta:"textScore"}}
  // );


  if (notices.length === 0) {
    throw HttpError.NotFoundError("Notices not found");
  }

  const maxPriceNotice = notices.reduce((acc, curr) => acc.price > curr.price ? acc : curr);
  const maxPriceInSearchResult = maxPriceNotice.price;

  if (sort) {
    notices = await buildSortObjectAfterSearchByKeywords(notices, sort)
  }

  let totalResult = await Notice.countDocuments(
    {$and: [{$text: {$search: keywords}}, buildFilterAfterSearchByKeywords(query)]}, {score: {$meta: "textScore"}}, 
    '-createdAt -updatedAt', 
    {skip, limit: Number(limit)})
    .sort({score:{$meta:"textScore"}})

    const totalPages = Math.ceil(totalResult / limit);

  res.status(200).json({
    totalResult,
    totalPages,
    page: +page,
    limit: +limit,
    maxPriceInSearchResult,
    notices,
  });
}; 

// const removeFromInactive = async (req, res) => {
//   const today = new Date();
//   const thirtyDays = today.getTime() - (1*24*60*60*1000);
//   await InactiveNotice.aggregate([
//     { $match: 
//       { createdAt: {
//           $lt: new Date(thirtyDays)} 
//       }
//     }, 
//     {
//         $merge: {
//             into: "notices",
//             on: "_id",
//             whenMatched: "replace",
//             whenNotMatched: "insert"
//         }
//     }
//     ]);
//     await InactiveNotice.deleteMany({ createdAt: {
//       $lt: new Date(thirtyDays)} 
//     });
// }

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
  getAllUserNotices: controllerWrapper(getAllUserNotices),
  getFavoriteUserNotices: controllerWrapper(getFavoriteUserNotices),
  addNoticeToFavorite: controllerWrapper(addNoticeToFavorite),
  //sendDeactivationLetter: controllerWrapper(sendDeactivationLetter),
  //removeFromInactive: controllerWrapper(removeFromInactive),
  searchNoticesByKeywords: controllerWrapper(searchNoticesByKeywords),
};