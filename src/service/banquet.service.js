/** @format */

const { asyncHandler } = require("../helper/async-error.helper");
const { modifyResponse } = require("../helper/local.helpers");
const Banquet = require("../model/banquet.model");

const createBanquet = async (info) => {
  return asyncHandler(async () => {
    const banquet = new Banquet(info);

    const savedBanquet = await banquet.save();
    return savedBanquet instanceof Banquet ? savedBanquet.toJSON() : false;
  });
};

const findAndUpdateBanquet = async (findInfo, setInfo) => {
  return asyncHandler(async () => {
    const banquet = await Banquet.findOneAndUpdate(
      findInfo,
      {
        $set: setInfo,
      },
      { new: true, runValidators: true }
    );
    return banquet ? banquet : false;
  });
};

const findBanquetById = async (id) => {
  return asyncHandler(async () => {
    const banquet = await Banquet.findOne({ _id: id, status: true })
      .populate("reviews.user", "firstName lastName profilePicture")
      .populate("createdBy", "firstName lastName profilePicture")
      .exec();
    if (banquet) {
      return modifyResponse([banquet], "banquet");
    } else {
      return false;
    }
  });
};

const findBanquetsByCity = async (city) => {
  return asyncHandler(async () => {
    const banquets = await Banquet.find({
      city: { $regex: `^${city}$`, $options: "i" },
      status: true,
    })
      .collation({ locale: "en", strength: 2 })
      .populate("reviews.user", "firstName lastName profilePicture")
      .populate("createdBy", "firstName lastName profilePicture")
      .sort({ createdAt: -1 })
      .exec();

    if (banquets.length > 0) {
      return modifyResponse(banquets, "banquet");
    } else {
      return false;
    }
  });
};

const findBanquetByIdHelper = async (id) => {
  return asyncHandler(async () => {
    const banquet = await Banquet.findOne({ _id: id, status: true });
    return banquet ? banquet : false;
  });
};

const searchBanquets = async (query) => {
  return asyncHandler(async () => {
    const banquets = await Banquet.find({
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
    return banquets.length > 0 ? modifyResponse(banquets, "banquet") : false;
  });
};

module.exports = {
  createBanquet,
  findAndUpdateBanquet,
  findBanquetsByCity,
  findBanquetById,
  findBanquetByIdHelper,
  searchBanquets,
};
