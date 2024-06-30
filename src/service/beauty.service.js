/** @format */

const { asyncHandler } = require("../helper/async-error.helper");
const { modifyResponse } = require("../helper/local.helpers");
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
    let beautyRecord = await BeautyRecord.findOne({
      _id: id,
      status: true,
    })
      .populate("reviews.user", "firstName lastName profilePicture")
      .populate("createdBy", "firstName lastName profilePicture")
      .exec();
    if (beautyRecord) {
      return modifyResponse([beautyRecord], "beauty");
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
      .sort({ createdAt: -1 })
      .exec();

    if (beautyRecords.length > 0) {
      return modifyResponse(beautyRecords, "beauty");
    } else {
      return false;
    }
  });
};

const findBeautyRecordByIdHelper = async (id) => {
  return asyncHandler(async () => {
    const beautyRecord = await BeautyRecord.findOne({ _id: id, status: true });
    return beautyRecord ? beautyRecord : false;
  });
};

const searchBeautyRecords = async (query) => {
  return asyncHandler(async () => {
    const beautyRecords = await BeautyRecord.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { services: { $regex: query, $options: "i" } },
      ],
      status: true,
    })
      .populate("reviews.user", "firstName lastName profilePicture")
      .populate("createdBy", "firstName lastName profilePicture")
      .sort({ createdAt: -1 })
      .exec();
    if (beautyRecords.length > 0) {
      return modifyResponse(beautyRecords, "beauty");
    } else {
      return false;
    }
  });
};

module.exports = {
  createBeautyRecord,
  findAndUpdateBeautyRecord,
  findBeautyRecordsByCity,
  findBeautyRecordById,
  findBeautyRecordByIdHelper,
  searchBeautyRecords,
};
