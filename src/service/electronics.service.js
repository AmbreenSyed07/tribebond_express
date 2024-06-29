/** @format */

const { asyncHandler } = require("../helper/async-error.helper");
const { modifyResponse } = require("../helper/local.helpers");
const Electronic = require("../model/electronics.model");

const createElectronic = async (info) => {
  return asyncHandler(async () => {
    const electronic = new Electronic(info);

    const savedElectronic = await electronic.save();
    return savedElectronic instanceof Electronic
      ? savedElectronic.toJSON()
      : false;
  });
};

const findAndUpdateElectronic = async (findInfo, setInfo) => {
  return asyncHandler(async () => {
    const electronic = await Electronic.findOneAndUpdate(
      findInfo,
      {
        $set: setInfo,
      },
      { new: true, runValidators: true }
    );
    return electronic ? electronic : false;
  });
};

const findElectronicById = async (id) => {
  return asyncHandler(async () => {
    const electronic = await Electronic.findOne({ _id: id, status: true })
      .populate("reviews.user", "firstName lastName profilePicture")
      .populate("createdBy", "firstName lastName profilePicture")
      .exec();
    if (electronic) {
      return modifyResponse([electronic], "electronics");
    } else {
      return false;
    }
  });
};

const findElectronicsByCity = async (city) => {
  return asyncHandler(async () => {
    const electronics = await Electronic.find({
      city: { $regex: `^${city}$`, $options: "i" },
      status: true,
    })
      .collation({ locale: "en", strength: 2 })
      .populate("reviews.user", "firstName lastName profilePicture")
      .populate("createdBy", "firstName lastName profilePicture")
      .sort({ createdAt: -1 })
      .exec();

    if (electronics.length > 0) {
      return modifyResponse(electronics, "electronics");
    } else {
      return false;
    }
  });
};

const findElectronicByIdHelper = async (id) => {
  return asyncHandler(async () => {
    const electronic = await Electronic.findOne({ _id: id, status: true });
    return electronic ? electronic : false;
  });
};

const searchElectronics = async (query) => {
  return asyncHandler(async () => {
    const electronics = await Electronic.find({
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
    return electronics.length > 0
      ? modifyResponse(electronics, "electronics")
      : false;
  });
};

module.exports = {
  createElectronic,
  findAndUpdateElectronic,
  findElectronicsByCity,
  findElectronicById,
  findElectronicByIdHelper,
  searchElectronics,
};
