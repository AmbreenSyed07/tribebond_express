/** @format */

const { asyncHandler } = require("../helper/async-error.helper");
const { modifyResponse } = require("../helper/local.helpers");
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
    const qurbani = await Qurbani.findOne({ _id: id, status: true })
      .populate("reviews.user", "firstName lastName profilePicture")
      .populate("createdBy", "firstName lastName profilePicture")
      .exec();
    if (qurbani) {
      return modifyResponse([qurbani], "qurbani");
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
      .sort({ createdAt: -1 })
      .exec();

    if (qurbanis.length > 0) {
      return modifyResponse(qurbanis, "qurbani");
    } else {
      return false;
    }
  });
};

const findQurbaniByIdHelper = async (id) => {
  return asyncHandler(async () => {
    const qurbani = await Qurbani.findOne({ _id: id, status: true });
    return qurbani ? qurbani : false;
  });
};

const searchQurbanis = async (query) => {
  return asyncHandler(async () => {
    const qurbanis = await Qurbani.find({
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
    if (qurbanis.length > 0) {
      return modifyResponse(qurbanis, "qurbani");
    } else {
      return false;
    }
  });
};

module.exports = {
  createQurbani,
  findAndUpdateQurbani,
  findQurbanisByCity,
  findQurbaniById,
  findQurbaniByIdHelper,
  searchQurbanis,
};
