/** @format */

const { asyncHandler } = require("../helper/async-error.helper");
const { modifyResponse } = require("../helper/local.helpers");
const SweetShop = require("../model/sweets.model");

const createSweetShop = async (info) => {
  return asyncHandler(async () => {
    const sweetShop = new SweetShop(info);
    const savedSweetShop = await sweetShop.save();
    return savedSweetShop instanceof SweetShop
      ? savedSweetShop.toJSON()
      : false;
  });
};

const findAndUpdateSweetShop = async (findInfo, setInfo) => {
  return asyncHandler(async () => {
    const sweetShop = await SweetShop.findOneAndUpdate(
      findInfo,
      {
        $set: setInfo,
      },
      { new: true, runValidators: true }
    );
    return sweetShop ? sweetShop : false;
  });
};

const findSweetShopById = async (id) => {
  return asyncHandler(async () => {
    const sweetShop = await SweetShop.findOne({
      _id: id,
      status: true,
    })
      .populate("reviews.user", "firstName lastName profilePicture")
      .populate("createdBy", "firstName lastName profilePicture")
      .exec();
    if (sweetShop) {
      return modifyResponse([sweetShop], "sweets");
    } else {
      return false;
    }
  });
};

const findSweetShopsByCity = async (city) => {
  return asyncHandler(async () => {
    const sweetShops = await SweetShop.find({
      city: { $regex: `^${city}$`, $options: "i" },
      status: true,
    })
      .collation({ locale: "en", strength: 2 })
      .populate("createdBy", "firstName lastName profilePicture")
      .populate("reviews.user", "firstName lastName profilePicture")
      .sort({ createdAt: -1 })
      .exec();
    if (sweetShops.length > 0) {
      return modifyResponse(sweetShops, "sweets");
    } else {
      return false;
    }
  });
};

const findSweetShopByIdHelper = async (id) => {
  return asyncHandler(async () => {
    const sweetShop = await SweetShop.findOne({ _id: id, status: true });
    return sweetShop ? sweetShop : false;
  });
};

const searchSweets = async (query) => {
  return asyncHandler(async () => {
    const sweets = await SweetShop.find({
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
    return sweets.length > 0 ? modifyResponse(sweets, "sweets") : false;
  });
};

module.exports = {
  createSweetShop,
  findAndUpdateSweetShop,
  findSweetShopsByCity,
  findSweetShopById,
  findSweetShopByIdHelper,
  searchSweets,
};
