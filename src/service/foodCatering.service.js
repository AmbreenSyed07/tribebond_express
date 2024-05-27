/** @format */

const { asyncHandler } = require("../helper/async-error.helper");
const { base_url } = require("../helper/local.helpers");
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
    const diningLocation = await FoodCatering.findById({ _id: id }).populate(
      "reviews.user",
      "firstName lastName profilePicture"
    );
    if (diningLocation) {
      let diningLocationObj = diningLocation.toObject();
      diningLocationObj?.reviews &&
        diningLocationObj?.reviews.length > 0 &&
        diningLocationObj?.reviews.forEach((review) => {
          if (
            review.user &&
            review.user.profilePicture &&
            !review.user.profilePicture.startsWith(base_url)
          ) {
            review.user.profilePicture = `${base_url}public/data/profile/${review.user._id}/${review.user.profilePicture}`;
          }
        });

      if (diningLocationObj.images && diningLocationObj.images.length > 0) {
        diningLocationObj.images = diningLocationObj.images.map((img) => {
          return `${base_url}public/data/food-catering/${diningLocationObj._id}/${img}`;
        });
      }
      return diningLocationObj;
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
      .exec();
    if (diningLocations.length > 0) {
      const modifiedDiningLocations = diningLocations.map((diningLocation) => {
        let diningLocationObj = diningLocation.toObject();

        diningLocationObj?.reviews &&
          diningLocationObj?.reviews.length > 0 &&
          diningLocationObj?.reviews.forEach((review) => {
            if (
              review.user &&
              review.user.profilePicture &&
              !review.user.profilePicture.startsWith(base_url)
            ) {
              review.user.profilePicture = `${base_url}public/data/profile/${review.user._id}/${review.user.profilePicture}`;
            }
          });

        if (diningLocationObj.images && diningLocationObj.images.length > 0) {
          diningLocationObj.images = diningLocationObj.images.map((img) => {
            return `${base_url}public/data/food-catering/${diningLocationObj._id}/${img}`;
          });
        }
        return diningLocationObj;
      });
      return modifiedDiningLocations;
    } else {
      return false;
    }
  });
};

const findDiningLocationByIdHelper = async (id) => {
  return asyncHandler(async () => {
    const diningLocation = await FoodCatering.findById(id);
    return diningLocation ? diningLocation : false;
  });
};

module.exports = {
  createDiningLocation,
  findAndUpdateDiningLocation,
  findDiningLocationsByCity,
  findDiningLocationById,
  findDiningLocationByIdHelper,
};
