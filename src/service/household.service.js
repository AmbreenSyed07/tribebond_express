/** @format */

const { asyncHandler } = require("../helper/async-error.helper");
const { modifyResponse } = require("../helper/local.helpers");
const Household = require("../model/household.model");

const createHouseholdItem = async (info) => {
  return asyncHandler(async () => {
    const householdItem = new Household(info);

    const savedHouseholdItem = await householdItem.save();
    return savedHouseholdItem instanceof Household
      ? savedHouseholdItem.toJSON()
      : false;
  });
};

const findAndUpdateHouseholdItem = async (findInfo, setInfo) => {
  return asyncHandler(async () => {
    const houseHoldItem = await Household.findOneAndUpdate(
      findInfo, // Match both ID and Type
      {
        $set: setInfo,
      },
      { new: true, runValidators: true } // Options to return the updated document and run schema validators
    );
    return houseHoldItem ? houseHoldItem : false;
  });
};

const findHouseholdItemById = async (id) => {
  return asyncHandler(async () => {
    const householdItem = await Household.findOne({
      _id: id,
      status: true,
    })
      .populate("reviews.user", "firstName lastName profilePicture")
      .populate("createdBy", "firstName lastName profilePicture")
      .exec();
    if (householdItem) {
      return modifyResponse([householdItem], "household");
    } else {
      return false;
    }
  });
};

const findHouseholdItemsByCity = async (city) => {
  return asyncHandler(async () => {
    const householdItems = await Household.find({
      city: { $regex: `^${city}$`, $options: "i" },
      status: true,
    })
      .collation({ locale: "en", strength: 2 })
      .populate("reviews.user", "firstName lastName profilePicture")
      .populate("createdBy", "firstName lastName profilePicture")
      .exec();
    if (householdItems.length > 0) {
      return modifyResponse(householdItems, "household");
    } else {
      return false;
    }
  });
};

const findHouseholdItemByIdHelper = async (id) => {
  return asyncHandler(async () => {
    const householdItem = await Household.findOne({ _id: id, status: true });
    return householdItem ? householdItem : false;
  });
};

const searchHouseholds = async (query) => {
  return asyncHandler(async () => {
    const households = await Household.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { city: { $regex: query, $options: "i" } },
      ],
      status: true,
    })
      .populate("reviews.user", "firstName lastName profilePicture")
      .populate("createdBy", "firstName lastName profilePicture")
      .exec();
    return households.length > 0
      ? modifyResponse(households, "household")
      : false;
  });
};

module.exports = {
  createHouseholdItem,
  findAndUpdateHouseholdItem,
  findHouseholdItemsByCity,
  findHouseholdItemById,
  findHouseholdItemByIdHelper,
  searchHouseholds,
};
