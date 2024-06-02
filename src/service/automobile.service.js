/** @format */

const { asyncHandler } = require("../helper/async-error.helper");
const { base_url, modifyResponse } = require("../helper/local.helpers");
const Automobile = require("../model/automobile.model");

const createAutomobile = async (info) => {
  return asyncHandler(async () => {
    const automobile = new Automobile(info);
    const savedAutomobile = await automobile.save();
    return savedAutomobile instanceof Automobile
      ? savedAutomobile.toJSON()
      : false;
  });
};

const findAndUpdateAutomobile = async (findInfo, setInfo) => {
  return asyncHandler(async () => {
    const automobile = await Automobile.findOneAndUpdate(
      findInfo,
      { $set: setInfo },
      { new: true, runValidators: true }
    );
    return automobile ? automobile : false;
  });
};

const findAutomobileById = async (id) => {
  return asyncHandler(async () => {
    const automobile = await Automobile.findById({ _id: id })
      .populate("reviews.user", "firstName lastName profilePicture")
      .populate("createdBy", "firstName lastName profilePicture")
      .exec();
    if (automobile) {
      let automobileObj = automobile.toObject();

      if (
        automobileObj.createdBy &&
        automobileObj.createdBy.profilePicture &&
        !automobileObj.createdBy.profilePicture.startsWith(base_url)
      ) {
        automobileObj.createdBy.profilePicture = `${base_url}public/data/profile/${automobileObj.createdBy._id}/${automobileObj.createdBy.profilePicture}`;
      }
      automobileObj?.reviews &&
        automobileObj?.reviews.length > 0 &&
        automobileObj?.reviews.forEach((review) => {
          if (
            review.user &&
            review.user.profilePicture &&
            !review.user.profilePicture.startsWith(base_url)
          ) {
            review.user.profilePicture = `${base_url}public/data/profile/${review.user._id}/${review.user.profilePicture}`;
          }
        });

      if (automobileObj.images && automobileObj.images.length > 0) {
        automobileObj.images = automobileObj.images.map((img) => {
          return `${base_url}public/data/automobile/${automobileObj._id}/${img}`;
        });
      }
      return automobileObj;
    } else {
      return false;
    }
  });
};

const findAutomobilesByCity = async (city) => {
  return asyncHandler(async () => {
    const automobiles = await Automobile.find({
      city: { $regex: `^${city}$`, $options: "i" },
      status: true,
    })
      .collation({ locale: "en", strength: 2 })
      .populate("reviews.user", "firstName lastName profilePicture")
      .populate("createdBy", "firstName lastName profilePicture")
      .exec();

    if (automobiles.length > 0) {
      const modifiedAutomobiles = automobiles.map((automobile) => {
        let automobileObj = automobile.toObject();

        if (
          automobileObj.createdBy &&
          automobileObj.createdBy.profilePicture &&
          !automobileObj.createdBy.profilePicture.startsWith(base_url)
        ) {
          automobileObj.createdBy.profilePicture = `${base_url}public/data/profile/${automobileObj.createdBy._id}/${automobileObj.createdBy.profilePicture}`;
        }

        automobileObj?.reviews &&
          automobileObj?.reviews.length > 0 &&
          automobileObj?.reviews.forEach((review) => {
            if (
              review.user &&
              review.user.profilePicture &&
              !review.user.profilePicture.startsWith(base_url)
            ) {
              review.user.profilePicture = `${base_url}public/data/profile/${review.user._id}/${review.user.profilePicture}`;
            }
          });

        if (automobileObj.images && automobileObj.images.length > 0) {
          automobileObj.images = automobileObj.images.map((img) => {
            return `${base_url}public/data/automobile/${automobileObj._id}/${img}`;
          });
        }
        return automobileObj;
      });
      return modifiedAutomobiles;
    } else {
      return false;
    }
  });
};

const findAutomobileByIdHelper = async (id) => {
  return asyncHandler(async () => {
    const automobile = await Automobile.findOne({ _id: id, status: true });
    return automobile ? automobile : false;
  });
};

const searchAutomobiles = async (query) => {
  return asyncHandler(async () => {
    const automobiles = await Automobile.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { city: { $regex: query, $options: "i" } },
      ],
    })
      .populate("reviews.user", "firstName lastName profilePicture")
      .populate("createdBy", "firstName lastName profilePicture")
      .exec();
    return automobiles.length > 0
      ? modifyResponse(automobiles, "automobile")
      : false;
  });
};

module.exports = {
  createAutomobile,
  findAndUpdateAutomobile,
  findAutomobilesByCity,
  findAutomobileById,
  findAutomobileByIdHelper,
  searchAutomobiles,
};
