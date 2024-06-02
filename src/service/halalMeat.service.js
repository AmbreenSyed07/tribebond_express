const { asyncHandler } = require("../helper/async-error.helper");
const { base_url, modifyResponse } = require("../helper/local.helpers");
const HalalMeat = require("../model/halalMeat.model");

const createMeat = async (info) => {
  return asyncHandler(async () => {
    const meat = new HalalMeat(info);

    const savedMeat = await meat.save();
    return savedMeat instanceof HalalMeat ? savedMeat.toJSON() : false;
  });
};

const findAndUpdateMeat = async (findInfo, setInfo) => {
  return asyncHandler(async () => {
    const meat = await HalalMeat.findOneAndUpdate(
      findInfo, // Match both ID and Type
      {
        $set: setInfo,
      },
      { new: true, runValidators: true } // Options to return the updated document and run schema validators
    );
    return meat ? meat : false;
  });
};

const findMeatById = async (id) => {
  return asyncHandler(async () => {
    const meat = await HalalMeat.findById({ _id: id }).populate(
      "reviews.user",
      "firstName lastName profilePicture"
    );
    if (meat) {
      let meatObj = meat.toObject();
      meatObj?.reviews &&
        meatObj?.reviews.length > 0 &&
        meatObj?.reviews.forEach((review) => {
          if (
            review.user &&
            review.user.profilePicture &&
            !review.user.profilePicture.startsWith(base_url)
          ) {
            review.user.profilePicture = `${base_url}public/data/profile/${review.user._id}/${review.user.profilePicture}`;
          }
        });

      if (meatObj.images && meatObj.images.length > 0) {
        meatObj.images = meatObj.images.map((img) => {
          return `${base_url}public/data/halal-meat/${meatObj._id}/${img}`;
        });
      }
      return meatObj;
    } else {
      return false;
    }
  });
};

const findMeatsByCity = async (city) => {
  return asyncHandler(async () => {
    const meats = await HalalMeat.find({
      city: { $regex: `^${city}$`, $options: "i" },
      status: true,
    })
      .collation({ locale: "en", strength: 2 })
      .populate("reviews.user", "firstName lastName profilePicture")
      .exec();
    // return meats.length > 0 ? meats : false;
    if (meats.length > 0) {
      const modifiedMeats = meats.map((meat) => {
        let meatObj = meat.toObject();

        meatObj?.reviews &&
          meatObj?.reviews.length > 0 &&
          meatObj?.reviews.forEach((review) => {
            if (
              review.user &&
              review.user.profilePicture &&
              !review.user.profilePicture.startsWith(base_url)
            ) {
              review.user.profilePicture = `${base_url}public/data/profile/${review.user._id}/${review.user.profilePicture}`;
            }
          });

        if (meatObj.images && meatObj.images.length > 0) {
          meatObj.images = meatObj.images.map((img) => {
            return `${base_url}public/data/halal-meat/${meatObj._id}/${img}`;
          });
        }
        return meatObj;
      });
      return modifiedMeats;
    } else {
      return false;
    }
  });
};

const findMeatByIdHelper = async (id) => {
  return asyncHandler(async () => {
    const meat = await HalalMeat.findOne({ _id: id, status: true });
    return meat ? meat : false;
  });
};

const searchHalalMeats = async (query) => {
  return asyncHandler(async () => {
    const halalMeats = await HalalMeat.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { city: { $regex: query, $options: "i" } },
      ],
    })
      .populate("createdBy", "firstName lastName profilePicture")
      .exec();
    return halalMeats.length > 0
      ? modifyResponse(halalMeats, "halal-meat")
      : false;
  });
};

module.exports = {
  createMeat,
  findAndUpdateMeat,
  findMeatsByCity,
  findMeatById,
  findMeatByIdHelper,
  searchHalalMeats,
};
