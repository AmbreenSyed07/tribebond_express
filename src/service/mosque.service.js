/** @format */

const { asyncHandler } = require("../helper/async-error.helper");
const { modifyResponse } = require("../helper/local.helpers");
const Mosque = require("../model/mosque.model");

const createMosqueRecord = async (info) => {
  return asyncHandler(async () => {
    const mosqueRecord = new Mosque(info);

    const savedMosqueRecord = await mosqueRecord.save();
    return savedMosqueRecord instanceof Mosque
      ? savedMosqueRecord.toJSON()
      : false;
  });
};

const findAndUpdateMosqueRecord = async (findInfo, setInfo) => {
  return asyncHandler(async () => {
    const mosqueRecord = await Mosque.findOneAndUpdate(
      findInfo, // Match both ID and Type
      {
        $set: setInfo,
      },
      { new: true, runValidators: true } // Options to return the updated document and run schema validators
    );
    return mosqueRecord ? mosqueRecord : false;
  });
};

const findMosqueRecordById = async (id) => {
  return asyncHandler(async () => {
    const mosqueRecord = await Mosque.findOne({ _id: id, status: true })
      .populate("reviews.user", "firstName lastName profilePicture")
      .populate("createdBy", "firstName lastName profilePicture")
      .exec();
    return mosqueRecord ? modifyResponse([mosqueRecord], "mosque") : false;
  });
};

const findMosqueRecordsByCity = async (city) => {
  return asyncHandler(async () => {
    const mosqueRecords = await Mosque.find({
      city: { $regex: `^${city}$`, $options: "i" },
      status: true,
    })
      .collation({ locale: "en", strength: 2 })
      .populate("reviews.user", "firstName lastName profilePicture")
      .populate("createdBy", "firstName lastName profilePicture")
      .sort({ createdAt: -1 })
      .exec();

    return mosqueRecords.length > 0
      ? modifyResponse(mosqueRecords, "mosque")
      : false;
  });
};

const findMosqueRecordByIdHelper = async (id) => {
  return asyncHandler(async () => {
    const mosqueRecord = await Mosque.findOne({ _id: id, status: true });
    return mosqueRecord ? mosqueRecord : false;
  });
};

const searchMosqueRecords = async (query) => {
  return asyncHandler(async () => {
    const mosqueRecords = await Mosque.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { city: { $regex: query, $options: "i" } },
      ],
      status: true,
    })
      .populate("reviews.user", "firstName lastName profilePicture")
      .populate("createdBy", "firstName lastName profilePicture")
      .sort({ createdAt: -1 })
      .exec();
    return mosqueRecords.length > 0
      ? modifyResponse(mosqueRecords, "mosque")
      : false;
  });
};

module.exports = {
  createMosqueRecord,
  findAndUpdateMosqueRecord,
  findMosqueRecordsByCity,
  findMosqueRecordById,
  findMosqueRecordByIdHelper,
  searchMosqueRecords,
};
