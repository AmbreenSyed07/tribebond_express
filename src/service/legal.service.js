/** @format */

const { asyncHandler } = require("../helper/async-error.helper");
const { base_url, modifyResponse } = require("../helper/local.helpers");
const Legal = require("../model/legal.model");

const createLegal = async (info) => {
  return asyncHandler(async () => {
    const legal = new Legal(info);

    const savedLegal = await legal.save();
    return savedLegal instanceof Legal ? savedLegal.toJSON() : false;
  });
};

const findAndUpdateLegal = async (findInfo, setInfo) => {
  return asyncHandler(async () => {
    const legal = await Legal.findOneAndUpdate(
      findInfo,
      {
        $set: setInfo,
      },
      { new: true, runValidators: true }
    );
    return legal ? legal : false;
  });
};

const findLegalById = async (id) => {
  return asyncHandler(async () => {
    const legal = await Legal.findOne({ _id: id, status: true })
      .populate("reviews.user", "firstName lastName profilePicture")
      .populate("createdBy", "firstName lastName profilePicture")
      .exec();
    if (legal) {
      return modifyResponse([legal], "legal");
    } else {
      return false;
    }
  });
};

const findLegalsByCity = async (city) => {
  return asyncHandler(async () => {
    const legals = await Legal.find({
      city: { $regex: `^${city}$`, $options: "i" },
      status: true,
    })
      .collation({ locale: "en", strength: 2 })
      .populate("reviews.user", "firstName lastName profilePicture")
      .populate("createdBy", "firstName lastName profilePicture")
      .sort({ createdAt: -1 })
      .exec();

    if (legals.length > 0) {
      return modifyResponse(legals, "legal");
    } else {
      return false;
    }
  });
};

const findLegalByIdHelper = async (id) => {
  return asyncHandler(async () => {
    const legal = await Legal.findOne({ _id: id, status: true });
    return legal ? legal : false;
  });
};

const searchLegals = async (query) => {
  return asyncHandler(async () => {
    const legals = await Legal.find({
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
    return legals.length > 0 ? modifyResponse(legals, "legal") : false;
  });
};

module.exports = {
  createLegal,
  findAndUpdateLegal,
  findLegalsByCity,
  findLegalById,
  findLegalByIdHelper,
  searchLegals,
};
