/** @format */

const { asyncHandler } = require("../helper/async-error.helper");
const { base_url } = require("../helper/local.helpers");
const Legal = require("../model/legal.model");

const createLegal = async (info) => {
  return asyncHandler(async () => {
    const legal = new Legal(info);

    const savedLegal = await legal.save();
    return savedLegal instanceof Legal ? savedLegal.toJSON() : false;
  });
};

const findAndUpdateLegal = async (findInfo, setInfo) => {
  return asyncHandler(async () => {
    const legal = await Legal.findOneAndUpdate(
      findInfo,
      {
        $set: setInfo,
      },
      { new: true, runValidators: true }
    );
    return legal ? legal : false;
  });
};

const findLegalById = async (id) => {
  return asyncHandler(async () => {
    const legal = await Legal.findById({ _id: id })
      .populate("reviews.user", "firstName lastName profilePicture")
      .populate("createdBy", "firstName lastName profilePicture")
      .exec();
    if (legal) {
      let legalObj = legal.toObject();

      if (
        legalObj.createdBy &&
        legalObj.createdBy.profilePicture &&
        !legalObj.createdBy.profilePicture.startsWith(base_url)
      ) {
        legalObj.createdBy.profilePicture = `${base_url}public/data/profile/${legalObj.createdBy._id}/${legalObj.createdBy.profilePicture}`;
      }
      legalObj?.reviews &&
        legalObj?.reviews.length > 0 &&
        legalObj?.reviews.forEach((review) => {
          if (
            review.user &&
            review.user.profilePicture &&
            !review.user.profilePicture.startsWith(base_url)
          ) {
            review.user.profilePicture = `${base_url}public/data/profile/${review.user._id}/${review.user.profilePicture}`;
          }
        });

      if (legalObj.images && legalObj.images.length > 0) {
        legalObj.images = legalObj.images.map((img) => {
          return `${base_url}public/data/legal/${legalObj._id}/${img}`;
        });
      }
      return legalObj;
    } else {
      return false;
    }
  });
};

const findLegalsByCity = async (city) => {
  return asyncHandler(async () => {
    const legals = await Legal.find({
      city: { $regex: `^${city}$`, $options: "i" },
      status: true,
    })
      .collation({ locale: "en", strength: 2 })
      .populate("reviews.user", "firstName lastName profilePicture")
      .populate("createdBy", "firstName lastName profilePicture")
      .exec();

    if (legals.length > 0) {
      const modifiedLegals = legals.map((legal) => {
        let legalObj = legal.toObject();

        if (
          legalObj.createdBy &&
          legalObj.createdBy.profilePicture &&
          !legalObj.createdBy.profilePicture.startsWith(base_url)
        ) {
          legalObj.createdBy.profilePicture = `${base_url}public/data/profile/${legalObj.createdBy._id}/${legalObj.createdBy.profilePicture}`;
        }

        legalObj?.reviews &&
          legalObj?.reviews.length > 0 &&
          legalObj?.reviews.forEach((review) => {
            if (
              review.user &&
              review.user.profilePicture &&
              !review.user.profilePicture.startsWith(base_url)
            ) {
              review.user.profilePicture = `${base_url}public/data/profile/${review.user._id}/${review.user.profilePicture}`;
            }
          });

        if (legalObj.images && legalObj.images.length > 0) {
          legalObj.images = legalObj.images.map((img) => {
            return `${base_url}public/data/legal/${legalObj._id}/${img}`;
          });
        }
        return legalObj;
      });
      return modifiedLegals;
    } else {
      return false;
    }
  });
};

const findLegalByIdHelper = async (id) => {
  return asyncHandler(async () => {
    const legal = await Legal.findById(id);
    return legal ? legal : false;
  });
};

const searchLegals = async (query) => {
  return asyncHandler(async () => {
    const legals = await Legal.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { services: { $regex: query, $options: "i" } },
      ],
    });
    return legals;
  });
};

module.exports = {
  createLegal,
  findAndUpdateLegal,
  findLegalsByCity,
  findLegalById,
  findLegalByIdHelper,
  searchLegals,
};
