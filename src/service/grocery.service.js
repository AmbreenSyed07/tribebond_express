const { asyncHandler } = require("../helper/async-error.helper");
const { modifyResponse } = require("../helper/local.helpers");
const Grocery = require("../model/grocery.model");

const createGrocery = async (info) => {
  return asyncHandler(async () => {
    const grocery = new Grocery(info);

    const savedGrocery = await grocery.save();
    return savedGrocery instanceof Grocery ? savedGrocery.toJSON() : false;
  });
};

const findAndUpdateGrocery = async (findInfo, setInfo) => {
  return asyncHandler(async () => {
    const grocery = await Grocery.findOneAndUpdate(
      findInfo, // Match both ID and Type
      {
        $set: setInfo,
      },
      { new: true, runValidators: true } // Options to return the updated document and run schema validators
    );
    return grocery ? grocery : false;
  });
};

const findGroceryById = async (id) => {
  return asyncHandler(async () => {
    const grocery = await Grocery.findOne({ _id: id, status: true })
      .populate("reviews.user", "firstName lastName profilePicture")
      .populate("createdBy", "firstName lastName profilePicture")
      .exec();
    if (grocery) {
      return modifyResponse([grocery], "grocery");
    } else {
      return false;
    }
  });
};

const findGroceriesByCity = async (city) => {
  return asyncHandler(async () => {
    const groceries = await Grocery.find({
      city: { $regex: `^${city}$`, $options: "i" },
      status: true,
    })
      .collation({ locale: "en", strength: 2 })
      .populate("reviews.user", "firstName lastName profilePicture")
      .populate("createdBy", "firstName lastName profilePicture")
      .sort({ createdAt: -1 })
      .exec();
    if (groceries.length > 0) {
      return modifyResponse(groceries, "grocery");
    } else {
      return false;
    }
  });
};

const findGroceryByIdHelper = async (id) => {
  return asyncHandler(async () => {
    const grocery = await Grocery.findOne({ _id: id, status: true });
    return grocery ? grocery : false;
  });
};

const searchGroceries = async (query) => {
  return asyncHandler(async () => {
    const groceries = await Grocery.find({
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
    return groceries.length > 0 ? modifyResponse(groceries, "grocery") : false;
  });
};

module.exports = {
  createGrocery,
  findAndUpdateGrocery,
  findGroceriesByCity,
  findGroceryById,
  findGroceryByIdHelper,
  searchGroceries,
};
