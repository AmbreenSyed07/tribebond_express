/** @format */

const { asyncHandler } = require("../helper/async-error.helper");
const { base_url, modifyResponse } = require("../helper/local.helpers");
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
    let realEstateRecord = await RealEstateRecord.findOne({
      _id: id,
      status: true,
    })
      .populate("reviews.user", "firstName lastName profilePicture")
      .populate("createdBy", "firstName lastName profilePicture")
      .exec();
    if (realEstateRecord) {
      return modifyResponse([realEstateRecord], "realEstate");
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
      .sort({ createdAt: -1 })
      .exec();

    if (realEstateRecords.length > 0) {
      return modifyResponse(realEstateRecords, "realEstate");
    } else {
      return false;
    }
  });
};

const findRealEstateRecordByIdHelper = async (id) => {
  return asyncHandler(async () => {
    const realEstateRecord = await RealEstateRecord.findOne({
      _id: id,
      status: true,
    });
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
      status: true,
    })
      .populate("reviews.user", "firstName lastName profilePicture")
      .populate("createdBy", "firstName lastName profilePicture")
      .sort({ createdAt: -1 })
      .exec();
    if (realEstates.length > 0) {
      return modifyResponse(realEstates, "realEstate");
    } else {
      return false;
    }
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
