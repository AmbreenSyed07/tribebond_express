const { asyncHandler } = require("../helper/async-error.helper");
const { modifyResponse } = require("../helper/local.helpers");
const HalalMeat = require("../model/halalMeat.model");

const createMeat = async (info) => {
  return asyncHandler(async () => {
    const meat = new HalalMeat(info);

    const savedMeat = await meat.save();
    return savedMeat instanceof HalalMeat ? savedMeat.toJSON() : false;
  });
};

const findAndUpdateMeat = async (findInfo, setInfo) => {
  return asyncHandler(async () => {
    const meat = await HalalMeat.findOneAndUpdate(
      findInfo, // Match both ID and Type
      {
        $set: setInfo,
      },
      { new: true, runValidators: true } // Options to return the updated document and run schema validators
    );
    return meat ? meat : false;
  });
};

const findMeatById = async (id) => {
  return asyncHandler(async () => {
    const meat = await HalalMeat.findOne({ _id: id, status: true })
      .populate("reviews.user", "firstName lastName profilePicture")
      .populate("createdBy", "firstName lastName profilePicture")
      .exec();
    if (meat) {
      return modifyResponse([meat], "halal-meat");
    } else {
      return false;
    }
  });
};

const findMeatsByCity = async (city) => {
  return asyncHandler(async () => {
    const meats = await HalalMeat.find({
      city: { $regex: `^${city}$`, $options: "i" },
      status: true,
    })
      .collation({ locale: "en", strength: 2 })
      .populate("reviews.user", "firstName lastName profilePicture")
      .populate("createdBy", "firstName lastName profilePicture")
      .sort({ createdAt: -1 })
      .exec();
    if (meats.length > 0) {
      return modifyResponse(meats, "halal-meat");
    } else {
      return false;
    }
  });
};

const findMeatByIdHelper = async (id) => {
  return asyncHandler(async () => {
    const meat = await HalalMeat.findOne({ _id: id, status: true });
    return meat ? meat : false;
  });
};

const searchHalalMeats = async (query) => {
  return asyncHandler(async () => {
    const halalMeats = await HalalMeat.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { city: { $regex: query, $options: "i" } },
      ],
      status: true,
    })
      .populate("createdBy", "firstName lastName profilePicture")
      .populate("reviews.user", "firstName lastName profilePicture")
      .sort({ createdAt: -1 })
      .exec();
    return halalMeats.length > 0
      ? modifyResponse(halalMeats, "halal-meat")
      : false;
  });
};

module.exports = {
  createMeat,
  findAndUpdateMeat,
  findMeatsByCity,
  findMeatById,
  findMeatByIdHelper,
  searchHalalMeats,
};
