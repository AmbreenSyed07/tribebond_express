/** @format */

const { asyncHandler } = require("../helper/async-error.helper");
const { modifyResponse } = require("../helper/local.helpers");
const FoodCatering = require("../model/foodCatering.model");

const createDiningLocation = async (info) => {
  return asyncHandler(async () => {
    const diningLocation = new FoodCatering(info);

    const savedDiningLocation = await diningLocation.save();
    return savedDiningLocation instanceof FoodCatering
      ? savedDiningLocation.toJSON()
      : false;
  });
};

const findAndUpdateDiningLocation = async (findInfo, setInfo) => {
  return asyncHandler(async () => {
    const diningLocation = await FoodCatering.findOneAndUpdate(
      findInfo,
      {
        $set: setInfo,
      },
      { new: true, runValidators: true }
    );
    return diningLocation ? diningLocation : false;
  });
};

const findDiningLocationById = async (id) => {
  return asyncHandler(async () => {
    const diningLocation = await FoodCatering.findOne({
      _id: id,
      status: true,
    })
      .populate("reviews.user", "firstName lastName profilePicture")
      .populate("createdBy", "firstName lastName profilePicture")
      .exec();
    if (diningLocation) {
      return modifyResponse([diningLocation], "food-catering");
    } else {
      return false;
    }
  });
};

const findDiningLocationsByCity = async (city) => {
  return asyncHandler(async () => {
    const diningLocations = await FoodCatering.find({
      city: { $regex: `^${city}$`, $options: "i" },
      status: true,
    })
      .collation({ locale: "en", strength: 2 })
      .populate("reviews.user", "firstName lastName profilePicture")
      .populate("createdBy", "firstName lastName profilePicture")
      .exec();
    if (diningLocations.length > 0) {
      return modifyResponse(diningLocations, "food-catering");
    } else {
      return false;
    }
  });
};

const findDiningLocationByIdHelper = async (id) => {
  return asyncHandler(async () => {
    const diningLocation = await FoodCatering.findOne({
      _id: id,
      status: true,
    });
    return diningLocation ? diningLocation : false;
  });
};

const searchFoodCaterings = async (query) => {
  return asyncHandler(async () => {
    const foodCaterings = await FoodCatering.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { city: { $regex: query, $options: "i" } },
      ],
      status: true,
    })
      .populate("reviews.user", "firstName lastName profilePicture")
      .populate("createdBy", "firstName lastName profilePicture")
      .exec();
    return foodCaterings.length > 0
      ? modifyResponse(foodCaterings, "food-catering")
      : false;
  });
};

module.exports = {
  createDiningLocation,
  findAndUpdateDiningLocation,
  findDiningLocationsByCity,
  findDiningLocationById,
  findDiningLocationByIdHelper,
  searchFoodCaterings,
};
