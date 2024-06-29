/** @format */

const { asyncHandler } = require("../helper/async-error.helper");
const { modifyResponse } = require("../helper/local.helpers");
const Henna = require("../model/henna.model");

const createHenna = async (info) => {
  return asyncHandler(async () => {
    const henna = new Henna(info);

    const savedHenna = await henna.save();
    return savedHenna instanceof Henna ? savedHenna.toJSON() : false;
  });
};

const findAndUpdateHenna = async (findInfo, setInfo) => {
  return asyncHandler(async () => {
    const henna = await Henna.findOneAndUpdate(
      findInfo,
      {
        $set: setInfo,
      },
      { new: true, runValidators: true }
    );
    return henna ? henna : false;
  });
};

const findHennaById = async (id) => {
  return asyncHandler(async () => {
    let henna = await Henna.findOne({ _id: id, status: true })
      .populate("reviews.user", "firstName lastName profilePicture")
      .populate("createdBy", "firstName lastName profilePicture")
      .exec();
    if (henna) {
      return modifyResponse([henna], "henna");
    } else {
      return false;
    }
  });
};

const findHennasByCity = async (city) => {
  return asyncHandler(async () => {
    const hennas = await Henna.find({
      city: { $regex: `^${city}$`, $options: "i" },
      status: true,
    })
      .collation({ locale: "en", strength: 2 })
      .populate("reviews.user", "firstName lastName profilePicture")
      .populate("createdBy", "firstName lastName profilePicture")
      .sort({ createdAt: -1 })
      .exec();

    if (hennas.length > 0) {
      return modifyResponse(hennas, "henna");
    } else {
      return false;
    }
  });
};

const findHennaByIdHelper = async (id) => {
  return asyncHandler(async () => {
    const henna = await Henna.findOne({ _id: id, status: true });
    return henna ? henna : false;
  });
};

const searchHennas = async (query) => {
  return asyncHandler(async () => {
    const hennas = await Henna.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { city: { $regex: query, $options: "i" } },
        { servingCities: { $regex: query, $options: "i" } },
      ],
      status: true,
    })
      .populate("reviews.user", "firstName lastName profilePicture")
      .populate("createdBy", "firstName lastName profilePicture")
      .sort({ createdAt: -1 })
      .exec();
    return hennas.length > 0 ? modifyResponse(hennas, "henna") : false;
  });
};

module.exports = {
  createHenna,
  findAndUpdateHenna,
  findHennasByCity,
  findHennaById,
  findHennaByIdHelper,
  searchHennas,
};
