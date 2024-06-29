/** @format */

const { asyncHandler } = require("../helper/async-error.helper");
const { modifyResponse } = require("../helper/local.helpers");
const Automobile = require("../model/automobile.model");

const createAutomobile = async (info) => {
  return asyncHandler(async () => {
    const automobile = new Automobile(info);
    const savedAutomobile = await automobile.save();
    return savedAutomobile instanceof Automobile
      ? savedAutomobile.toJSON()
      : false;
  });
};

const findAndUpdateAutomobile = async (findInfo, setInfo) => {
  return asyncHandler(async () => {
    const automobile = await Automobile.findOneAndUpdate(
      findInfo,
      { $set: setInfo },
      { new: true, runValidators: true }
    );
    return automobile ? automobile : false;
  });
};

const findAutomobileById = async (id) => {
  return asyncHandler(async () => {
    const automobile = await Automobile.findOne({ _id: id, status: true })
      .populate("reviews.user", "firstName lastName profilePicture")
      .populate("createdBy", "firstName lastName profilePicture")
      .exec();
    if (automobile) {
      return modifyResponse([automobile], "automobile");
    } else {
      return false;
    }
  });
};

const findAutomobilesByCity = async (city) => {
  return asyncHandler(async () => {
    const automobiles = await Automobile.find({
      city: { $regex: `^${city}$`, $options: "i" },
      status: true,
    })
      .collation({ locale: "en", strength: 2 })
      .populate("reviews.user", "firstName lastName profilePicture")
      .populate("createdBy", "firstName lastName profilePicture")
      .sort({ createdAt: -1 })
      .exec();

    if (automobiles.length > 0) {
      return modifyResponse(automobiles, "automobile");
    } else {
      return false;
    }
  });
};

const findAutomobileByIdHelper = async (id) => {
  return asyncHandler(async () => {
    const automobile = await Automobile.findOne({ _id: id, status: true });
    return automobile ? automobile : false;
  });
};

const searchAutomobiles = async (query) => {
  return asyncHandler(async () => {
    const automobiles = await Automobile.find({
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
    return automobiles.length > 0
      ? modifyResponse(automobiles, "automobile")
      : false;
  });
};

module.exports = {
  createAutomobile,
  findAndUpdateAutomobile,
  findAutomobilesByCity,
  findAutomobileById,
  findAutomobileByIdHelper,
  searchAutomobiles,
};
