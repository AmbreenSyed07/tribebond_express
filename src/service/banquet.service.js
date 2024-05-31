/** @format */

const { asyncHandler } = require("../helper/async-error.helper");
const { base_url } = require("../helper/local.helpers");
const Banquet = require("../model/banquet.model");

const createBanquet = async (info) => {
  return asyncHandler(async () => {
    const banquet = new Banquet(info);

    const savedBanquet = await banquet.save();
    return savedBanquet instanceof Banquet ? savedBanquet.toJSON() : false;
  });
};

const findAndUpdateBanquet = async (findInfo, setInfo) => {
  return asyncHandler(async () => {
    const banquet = await Banquet.findOneAndUpdate(
      findInfo,
      {
        $set: setInfo,
      },
      { new: true, runValidators: true }
    );
    return banquet ? banquet : false;
  });
};

const findBanquetById = async (id) => {
  return asyncHandler(async () => {
    const banquet = await Banquet.findById({ _id: id })
      .populate("reviews.user", "firstName lastName profilePicture")
      .populate("createdBy", "firstName lastName profilePicture")
      .exec();
    if (banquet) {
      let banquetObj = banquet.toObject();

      if (
        banquetObj.createdBy &&
        banquetObj.createdBy.profilePicture &&
        !banquetObj.createdBy.profilePicture.startsWith(base_url)
      ) {
        banquetObj.createdBy.profilePicture = `${base_url}public/data/profile/${banquetObj.createdBy._id}/${banquetObj.createdBy.profilePicture}`;
      }
      banquetObj?.reviews &&
        banquetObj?.reviews.length > 0 &&
        banquetObj?.reviews.forEach((review) => {
          if (
            review.user &&
            review.user.profilePicture &&
            !review.user.profilePicture.startsWith(base_url)
          ) {
            review.user.profilePicture = `${base_url}public/data/profile/${review.user._id}/${review.user.profilePicture}`;
          }
        });

      if (banquetObj.images && banquetObj.images.length > 0) {
        banquetObj.images = banquetObj.images.map((img) => {
          return `${base_url}public/data/banquet/${banquetObj._id}/${img}`;
        });
      }
      return banquetObj;
    } else {
      return false;
    }
  });
};

const findBanquetsByCity = async (city) => {
  return asyncHandler(async () => {
    const banquets = await Banquet.find({
      city: { $regex: `^${city}$`, $options: "i" },
      status: true,
    })
      .collation({ locale: "en", strength: 2 })
      .populate("reviews.user", "firstName lastName profilePicture")
      .populate("createdBy", "firstName lastName profilePicture")
      .exec();

    if (banquets.length > 0) {
      const modifiedBanquets = banquets.map((banquet) => {
        let banquetObj = banquet.toObject();

        if (
          banquetObj.createdBy &&
          banquetObj.createdBy.profilePicture &&
          !banquetObj.createdBy.profilePicture.startsWith(base_url)
        ) {
          banquetObj.createdBy.profilePicture = `${base_url}public/data/profile/${banquetObj.createdBy._id}/${banquetObj.createdBy.profilePicture}`;
        }

        banquetObj?.reviews &&
          banquetObj?.reviews.length > 0 &&
          banquetObj?.reviews.forEach((review) => {
            if (
              review.user &&
              review.user.profilePicture &&
              !review.user.profilePicture.startsWith(base_url)
            ) {
              review.user.profilePicture = `${base_url}public/data/profile/${review.user._id}/${review.user.profilePicture}`;
            }
          });

        if (banquetObj.images && banquetObj.images.length > 0) {
          banquetObj.images = banquetObj.images.map((img) => {
            return `${base_url}public/data/banquet/${banquetObj._id}/${img}`;
          });
        }
        return banquetObj;
      });
      return modifiedBanquets;
    } else {
      return false;
    }
  });
};

const findBanquetByIdHelper = async (id) => {
  return asyncHandler(async () => {
    const banquet = await Banquet.findById(id);
    return banquet ? banquet : false;
  });
};

const searchBanquets = async (query) => {
  return asyncHandler(async () => {
    const banquets = await Banquet.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { city: { $regex: query, $options: "i" } },
      ],
    });
    return banquets;
  });
};

module.exports = {
  createBanquet,
  findAndUpdateBanquet,
  findBanquetsByCity,
  findBanquetById,
  findBanquetByIdHelper,
  searchBanquets,
};
