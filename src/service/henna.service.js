/** @format */

const { asyncHandler } = require("../helper/async-error.helper");
const { base_url } = require("../helper/local.helpers");
const Henna = require("../model/henna.model");

const createHenna = async (info) => {
  return asyncHandler(async () => {
    const henna = new Henna(info);

    const savedHenna = await henna.save();
    return savedHenna instanceof Henna ? savedHenna.toJSON() : false;
  });
};

const findAndUpdateHenna = async (findInfo, setInfo) => {
  return asyncHandler(async () => {
    const henna = await Henna.findOneAndUpdate(
      findInfo,
      {
        $set: setInfo,
      },
      { new: true, runValidators: true }
    );
    return henna ? henna : false;
  });
};

const findHennaById = async (id) => {
  return asyncHandler(async () => {
    let henna = await Henna.findById({ _id: id })
      .populate("reviews.user", "firstName lastName profilePicture")
      .populate("createdBy", "firstName lastName profilePicture")
      .exec();
    if (henna) {
      let hennaObj = henna.toObject();

      if (
        hennaObj.createdBy &&
        hennaObj.createdBy.profilePicture &&
        !hennaObj.createdBy.profilePicture.startsWith(base_url)
      ) {
        hennaObj.createdBy.profilePicture = `${base_url}public/data/profile/${hennaObj.createdBy._id}/${hennaObj.createdBy.profilePicture}`;
      }
      hennaObj?.reviews &&
        hennaObj?.reviews.length > 0 &&
        hennaObj?.reviews.forEach((review) => {
          if (
            review.user &&
            review.user.profilePicture &&
            !review.user.profilePicture.startsWith(base_url)
          ) {
            review.user.profilePicture = `${base_url}public/data/profile/${review.user._id}/${review.user.profilePicture}`;
          }
        });

      if (hennaObj.images && hennaObj.images.length > 0) {
        hennaObj.images = hennaObj.images.map((img) => {
          return `${base_url}public/data/henna/${hennaObj._id}/${img}`;
        });
      }
      return hennaObj;
    } else {
      return false;
    }
  });
};

const findHennasByCity = async (city) => {
  return asyncHandler(async () => {
    const hennas = await Henna.find({
      city: { $regex: `^${city}$`, $options: "i" },
      status: true,
    })
      .collation({ locale: "en", strength: 2 })
      .populate("reviews.user", "firstName lastName profilePicture")
      .populate("createdBy", "firstName lastName profilePicture")
      .exec();

    if (hennas.length > 0) {
      const modifiedHennas = hennas.map((henna) => {
        let hennaObj = henna.toObject();

        if (
          hennaObj.createdBy &&
          hennaObj.createdBy.profilePicture &&
          !hennaObj.createdBy.profilePicture.startsWith(base_url)
        ) {
          hennaObj.createdBy.profilePicture = `${base_url}public/data/profile/${hennaObj.createdBy._id}/${hennaObj.createdBy.profilePicture}`;
        }

        hennaObj?.reviews &&
          hennaObj?.reviews.length > 0 &&
          hennaObj?.reviews.forEach((review) => {
            if (
              review.user &&
              review.user.profilePicture &&
              !review.user.profilePicture.startsWith(base_url)
            ) {
              review.user.profilePicture = `${base_url}public/data/profile/${review.user._id}/${review.user.profilePicture}`;
            }
          });

        if (hennaObj.images && hennaObj.images.length > 0) {
          hennaObj.images = hennaObj.images.map((img) => {
            return `${base_url}public/data/henna/${hennaObj._id}/${img}`;
          });
        }
        return hennaObj;
      });
      return modifiedHennas;
    } else {
      return false;
    }
  });
};

const findHennaByIdHelper = async (id) => {
  return asyncHandler(async () => {
    const henna = await Henna.findById(id);
    return henna ? henna : false;
  });
};

const searchHennas = async (query) => {
  return asyncHandler(async () => {
    const hennas = await Henna.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { city: { $regex: query, $options: "i" } },
      ],
    });
    return hennas;
  });
};

module.exports = {
  createHenna,
  findAndUpdateHenna,
  findHennasByCity,
  findHennaById,
  findHennaByIdHelper,
  searchHennas,
};
