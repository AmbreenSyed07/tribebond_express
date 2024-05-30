/** @format */

const { asyncHandler } = require("../helper/async-error.helper");
const { base_url } = require("../helper/local.helpers");
const Qurbani = require("../model/qurbani.model");

const createQurbani = async (info) => {
  return asyncHandler(async () => {
    const qurbani = new Qurbani(info);

    const savedQurbani = await qurbani.save();
    return savedQurbani instanceof Qurbani ? savedQurbani.toJSON() : false;
  });
};

const findAndUpdateQurbani = async (findInfo, setInfo) => {
  return asyncHandler(async () => {
    const qurbani = await Qurbani.findOneAndUpdate(
      findInfo,
      {
        $set: setInfo,
      },
      { new: true, runValidators: true }
    );
    return qurbani ? qurbani : false;
  });
};

const findQurbaniById = async (id) => {
  return asyncHandler(async () => {
    const qurbani = await Qurbani.findById({ _id: id })
      .populate("reviews.user", "firstName lastName profilePicture")
      .populate("createdBy", "firstName lastName profilePicture")
      .exec();
    if (qurbani) {
      let qurbaniObj = qurbani.toObject();

      if (
        qurbaniObj.createdBy &&
        qurbaniObj.createdBy.profilePicture &&
        !qurbaniObj.createdBy.profilePicture.startsWith(base_url)
      ) {
        qurbaniObj.createdBy.profilePicture = `${base_url}public/data/profile/${qurbaniObj.createdBy._id}/${qurbaniObj.createdBy.profilePicture}`;
      }
      qurbaniObj?.reviews &&
        qurbaniObj?.reviews.length > 0 &&
        qurbaniObj?.reviews.forEach((review) => {
          if (
            review.user &&
            review.user.profilePicture &&
            !review.user.profilePicture.startsWith(base_url)
          ) {
            review.user.profilePicture = `${base_url}public/data/profile/${review.user._id}/${review.user.profilePicture}`;
          }
        });

      if (qurbaniObj.images && qurbaniObj.images.length > 0) {
        qurbaniObj.images = qurbaniObj.images.map((img) => {
          return `${base_url}public/data/qurbani/${qurbaniObj._id}/${img}`;
        });
      }
      return qurbaniObj;
    } else {
      return false;
    }
  });
};

const findQurbanisByCity = async (city) => {
  return asyncHandler(async () => {
    const qurbanis = await Qurbani.find({
      city: { $regex: `^${city}$`, $options: "i" },
      status: true,
    })
      .collation({ locale: "en", strength: 2 })
      .populate("reviews.user", "firstName lastName profilePicture")
      .populate("createdBy", "firstName lastName profilePicture")
      .exec();

    if (qurbanis.length > 0) {
      const modifiedQurbanis = qurbanis.map((qurbani) => {
        let qurbaniObj = qurbani.toObject();

        if (
          qurbaniObj.createdBy &&
          qurbaniObj.createdBy.profilePicture &&
          !qurbaniObj.createdBy.profilePicture.startsWith(base_url)
        ) {
          qurbaniObj.createdBy.profilePicture = `${base_url}public/data/profile/${qurbaniObj.createdBy._id}/${qurbaniObj.createdBy.profilePicture}`;
        }

        qurbaniObj?.reviews &&
          qurbaniObj?.reviews.length > 0 &&
          qurbaniObj?.reviews.forEach((review) => {
            if (
              review.user &&
              review.user.profilePicture &&
              !review.user.profilePicture.startsWith(base_url)
            ) {
              review.user.profilePicture = `${base_url}public/data/profile/${review.user._id}/${review.user.profilePicture}`;
            }
          });

        if (qurbaniObj.images && qurbaniObj.images.length > 0) {
          qurbaniObj.images = qurbaniObj.images.map((img) => {
            return `${base_url}public/data/qurbani/${qurbaniObj._id}/${img}`;
          });
        }
        return qurbaniObj;
      });
      return modifiedQurbanis;
    } else {
      return false;
    }
  });
};

const findQurbaniByIdHelper = async (id) => {
  return asyncHandler(async () => {
    const qurbani = await Qurbani.findById(id);
    return qurbani ? qurbani : false;
  });
};

module.exports = {
  createQurbani,
  findAndUpdateQurbani,
  findQurbanisByCity,
  findQurbaniById,
  findQurbaniByIdHelper,
};
