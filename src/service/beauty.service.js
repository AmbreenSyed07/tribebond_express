/** @format */

const { asyncHandler } = require("../helper/async-error.helper");
const { base_url } = require("../helper/local.helpers");
const BeautyRecord = require("../model/beauty.model");

const createBeautyRecord = async (info) => {
  return asyncHandler(async () => {
    const beautyRecord = new BeautyRecord(info);

    const savedBeautyRecord = await beautyRecord.save();
    return savedBeautyRecord instanceof BeautyRecord
      ? savedBeautyRecord.toJSON()
      : false;
  });
};

const findAndUpdateBeautyRecord = async (findInfo, setInfo) => {
  return asyncHandler(async () => {
    const beautyRecord = await BeautyRecord.findOneAndUpdate(
      findInfo,
      {
        $set: setInfo,
      },
      { new: true, runValidators: true }
    );
    return beautyRecord ? beautyRecord : false;
  });
};

const findBeautyRecordById = async (id) => {
  return asyncHandler(async () => {
    let beautyRecord = await BeautyRecord.findById({ _id: id })
      .populate("reviews.user", "firstName lastName profilePicture")
      .populate("createdBy", "firstName lastName profilePicture")
      .exec();
    if (beautyRecord) {
      let beautyRecordObj = beautyRecord.toObject();

      if (
        beautyRecordObj.createdBy &&
        beautyRecordObj.createdBy.profilePicture &&
        !beautyRecordObj.createdBy.profilePicture.startsWith(base_url)
      ) {
        beautyRecordObj.createdBy.profilePicture = `${base_url}public/data/profile/${beautyRecordObj.createdBy._id}/${beautyRecordObj.createdBy.profilePicture}`;
      }
      beautyRecordObj?.reviews &&
        beautyRecordObj?.reviews.length > 0 &&
        beautyRecordObj?.reviews.forEach((review) => {
          if (
            review.user &&
            review.user.profilePicture &&
            !review.user.profilePicture.startsWith(base_url)
          ) {
            review.user.profilePicture = `${base_url}public/data/profile/${review.user._id}/${review.user.profilePicture}`;
          }
        });

      if (beautyRecordObj.images && beautyRecordObj.images.length > 0) {
        beautyRecordObj.images = beautyRecordObj.images.map((img) => {
          return `${base_url}public/data/beauty/${beautyRecordObj._id}/${img}`;
        });
      }
      return beautyRecordObj;
    } else {
      return false;
    }
  });
};

const findBeautyRecordsByCity = async (city) => {
  return asyncHandler(async () => {
    const beautyRecords = await BeautyRecord.find({
      city: { $regex: `^${city}$`, $options: "i" },
      status: true,
    })
      .collation({ locale: "en", strength: 2 })
      .populate("reviews.user", "firstName lastName profilePicture")
      .populate("createdBy", "firstName lastName profilePicture")
      .exec();

    if (beautyRecords.length > 0) {
      const modifiedBeautyRecords = beautyRecords.map((beautyRecord) => {
        let beautyRecordObj = beautyRecord.toObject();

        if (
          beautyRecordObj.createdBy &&
          beautyRecordObj.createdBy.profilePicture &&
          !beautyRecordObj.createdBy.profilePicture.startsWith(base_url)
        ) {
          beautyRecordObj.createdBy.profilePicture = `${base_url}public/data/profile/${beautyRecordObj.createdBy._id}/${beautyRecordObj.createdBy.profilePicture}`;
        }

        beautyRecordObj?.reviews &&
          beautyRecordObj?.reviews.length > 0 &&
          beautyRecordObj?.reviews.forEach((review) => {
            if (
              review.user &&
              review.user.profilePicture &&
              !review.user.profilePicture.startsWith(base_url)
            ) {
              review.user.profilePicture = `${base_url}public/data/profile/${review.user._id}/${review.user.profilePicture}`;
            }
          });

        if (beautyRecordObj.images && beautyRecordObj.images.length > 0) {
          beautyRecordObj.images = beautyRecordObj.images.map((img) => {
            return `${base_url}public/data/beauty/${beautyRecordObj._id}/${img}`;
          });
        }
        return beautyRecordObj;
      });
      return modifiedBeautyRecords;
    } else {
      return false;
    }
  });
};

const findBeautyRecordByIdHelper = async (id) => {
  return asyncHandler(async () => {
    const beautyRecord = await BeautyRecord.findById(id);
    return beautyRecord ? beautyRecord : false;
  });
};

module.exports = {
  createBeautyRecord,
  findAndUpdateBeautyRecord,
  findBeautyRecordsByCity,
  findBeautyRecordById,
  findBeautyRecordByIdHelper,
};
