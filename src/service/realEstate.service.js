/** @format */

const { asyncHandler } = require("../helper/async-error.helper");
const { base_url } = require("../helper/local.helpers");
const RealEstateRecord = require("../model/realEstate.model");

const createRealEstateRecord = async (info) => {
  return asyncHandler(async () => {
    const realEstateRecord = new RealEstateRecord(info);

    const savedRealEstateRecord = await realEstateRecord.save();
    return savedRealEstateRecord instanceof RealEstateRecord
      ? savedRealEstateRecord.toJSON()
      : false;
  });
};

const findAndUpdateRealEstateRecord = async (findInfo, setInfo) => {
  return asyncHandler(async () => {
    const realEstateRecord = await RealEstateRecord.findOneAndUpdate(
      findInfo,
      {
        $set: setInfo,
      },
      { new: true, runValidators: true }
    );
    return realEstateRecord ? realEstateRecord : false;
  });
};

const findRealEstateRecordById = async (id) => {
  return asyncHandler(async () => {
    let realEstateRecord = await RealEstateRecord.findById({ _id: id })
      .populate("reviews.user", "firstName lastName profilePicture")
      .populate("createdBy", "firstName lastName profilePicture")
      .exec();
    if (realEstateRecord) {
      let realEstateRecordObj = realEstateRecord.toObject();

      if (
        realEstateRecordObj.createdBy &&
        realEstateRecordObj.createdBy.profilePicture &&
        !realEstateRecordObj.createdBy.profilePicture.startsWith(base_url)
      ) {
        realEstateRecordObj.createdBy.profilePicture = `${base_url}public/data/profile/${realEstateRecordObj.createdBy._id}/${realEstateRecordObj.createdBy.profilePicture}`;
      }
      realEstateRecordObj?.reviews &&
        realEstateRecordObj?.reviews.length > 0 &&
        realEstateRecordObj?.reviews.forEach((review) => {
          if (
            review.user &&
            review.user.profilePicture &&
            !review.user.profilePicture.startsWith(base_url)
          ) {
            review.user.profilePicture = `${base_url}public/data/profile/${review.user._id}/${review.user.profilePicture}`;
          }
        });

      if (realEstateRecordObj.images && realEstateRecordObj.images.length > 0) {
        realEstateRecordObj.images = realEstateRecordObj.images.map((img) => {
          return `${base_url}public/data/realEstate/${realEstateRecordObj._id}/${img}`;
        });
      }
      return realEstateRecordObj;
    } else {
      return false;
    }
  });
};

const findRealEstateRecordsByCity = async (city) => {
  return asyncHandler(async () => {
    const realEstateRecords = await RealEstateRecord.find({
      city: { $regex: `^${city}$`, $options: "i" },
      status: true,
    })
      .collation({ locale: "en", strength: 2 })
      .populate("reviews.user", "firstName lastName profilePicture")
      .populate("createdBy", "firstName lastName profilePicture")
      .exec();

    if (realEstateRecords.length > 0) {
      const modifiedRealEstateRecords = realEstateRecords.map(
        (realEstateRecord) => {
          let realEstateRecordObj = realEstateRecord.toObject();

          if (
            realEstateRecordObj.createdBy &&
            realEstateRecordObj.createdBy.profilePicture &&
            !realEstateRecordObj.createdBy.profilePicture.startsWith(base_url)
          ) {
            realEstateRecordObj.createdBy.profilePicture = `${base_url}public/data/profile/${realEstateRecordObj.createdBy._id}/${realEstateRecordObj.createdBy.profilePicture}`;
          }

          realEstateRecordObj?.reviews &&
            realEstateRecordObj?.reviews.length > 0 &&
            realEstateRecordObj?.reviews.forEach((review) => {
              if (
                review.user &&
                review.user.profilePicture &&
                !review.user.profilePicture.startsWith(base_url)
              ) {
                review.user.profilePicture = `${base_url}public/data/profile/${review.user._id}/${review.user.profilePicture}`;
              }
            });

          if (
            realEstateRecordObj.images &&
            realEstateRecordObj.images.length > 0
          ) {
            realEstateRecordObj.images = realEstateRecordObj.images.map(
              (img) => {
                return `${base_url}public/data/realEstate/${realEstateRecordObj._id}/${img}`;
              }
            );
          }
          return realEstateRecordObj;
        }
      );
      return modifiedRealEstateRecords;
    } else {
      return false;
    }
  });
};

const findRealEstateRecordByIdHelper = async (id) => {
  return asyncHandler(async () => {
    const realEstateRecord = await RealEstateRecord.findById(id);
    return realEstateRecord ? realEstateRecord : false;
  });
};

const searchRealEstates = async (query) => {
  return asyncHandler(async () => {
    const realEstates = await RealEstateRecord.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { price: { $regex: query, $options: "i" } },
      ],
    });
    return realEstates;
  });
};

module.exports = {
  createRealEstateRecord,
  findAndUpdateRealEstateRecord,
  findRealEstateRecordsByCity,
  findRealEstateRecordById,
  findRealEstateRecordByIdHelper,
  searchRealEstates,
};
