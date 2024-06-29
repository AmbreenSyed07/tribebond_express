/** @format */

const { asyncHandler } = require("../helper/async-error.helper");
const { modifyResponse } = require("../helper/local.helpers");
const HealthRecord = require("../model/health.model");

const createHealthRecord = async (info) => {
  return asyncHandler(async () => {
    const healthRecord = new HealthRecord(info);

    const savedHealthRecord = await healthRecord.save();
    return savedHealthRecord instanceof HealthRecord
      ? savedHealthRecord.toJSON()
      : false;
  });
};

const findAndUpdateHealthRecord = async (findInfo, setInfo) => {
  return asyncHandler(async () => {
    const healthRecord = await HealthRecord.findOneAndUpdate(
      findInfo,
      {
        $set: setInfo,
      },
      { new: true, runValidators: true }
    );
    return healthRecord ? healthRecord : false;
  });
};

const findHealthRecordById = async (id) => {
  return asyncHandler(async () => {
    let healthRecord = await HealthRecord.findOne({ _id: id, status: true })
      .populate("reviews.user", "firstName lastName profilePicture")
      .populate("createdBy", "firstName lastName profilePicture")
      .exec();
    if (healthRecord) {
      return modifyResponse([healthRecord], "health");
    } else {
      return false;
    }
  });
};

const findHealthRecordsByCity = async (city) => {
  return asyncHandler(async () => {
    const healthRecords = await HealthRecord.find({
      city: { $regex: `^${city}$`, $options: "i" },
      status: true,
    })
      .collation({ locale: "en", strength: 2 })
      .populate("reviews.user", "firstName lastName profilePicture")
      .populate("createdBy", "firstName lastName profilePicture")
      .sort({ createdAt: -1 })
      .exec();

    if (healthRecords.length > 0) {
      return modifyResponse(healthRecords, "health");
    } else {
      return false;
    }
  });
};

const findHealthRecordByIdHelper = async (id) => {
  return asyncHandler(async () => {
    const healthRecord = await HealthRecord.findOne({ _id: id, status: true });
    return healthRecord ? healthRecord : false;
  });
};

const searchHealthRecords = async (query) => {
  return asyncHandler(async () => {
    const healthRecords = await HealthRecord.find({
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
    if (healthRecords.length > 0) {
      return modifyResponse(healthRecords, "health");
    } else {
      return false;
    }
  });
};

module.exports = {
  createHealthRecord,
  findAndUpdateHealthRecord,
  findHealthRecordsByCity,
  findHealthRecordById,
  findHealthRecordByIdHelper,
  searchHealthRecords,
};
