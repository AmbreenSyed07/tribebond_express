/** @format */

const { asyncHandler } = require("../helper/async-error.helper");
const { base_url } = require("../helper/local.helpers");
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
    const householdItem = await Household.findById({ _id: id }).populate(
      "reviews.user",
      "firstName lastName profilePicture"
    );
    if (householdItem) {
      let householdItemObj = householdItem.toObject();
      householdItemObj?.reviews &&
        householdItemObj?.reviews.length > 0 &&
        householdItemObj?.reviews.forEach((review) => {
          if (
            review.user &&
            review.user.profilePicture &&
            !review.user.profilePicture.startsWith(base_url)
          ) {
            review.user.profilePicture = `${base_url}public/data/profile/${review.user._id}/${review.user.profilePicture}`;
          }
        });

      if (householdItemObj.images && householdItemObj.images.length > 0) {
        householdItemObj.images = householdItemObj.images.map((img) => {
          return `${base_url}public/data/household/images/${householdItemObj._id}/${img}`;
        });
      }
      return householdItemObj;
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
      .exec();
    if (householdItems.length > 0) {
      const modifiedHouseholdItems = householdItems.map((householdItem) => {
        let householdItemObj = householdItem.toObject();

        householdItemObj?.reviews &&
          householdItemObj?.reviews.length > 0 &&
          householdItemObj?.reviews.forEach((review) => {
            if (
              review.user &&
              review.user.profilePicture &&
              !review.user.profilePicture.startsWith(base_url)
            ) {
              review.user.profilePicture = `${base_url}public/data/profile/${review.user._id}/${review.user.profilePicture}`;
            }
          });

        if (householdItemObj.images && householdItemObj.images.length > 0) {
          householdItemObj.images = householdItemObj.images.map((img) => {
            return `${base_url}public/data/household/images/${householdItemObj._id}/${img}`;
          });
        }
        return householdItemObj;
      });
      return modifiedHouseholdItems;
    } else {
      return false;
    }
  });
};

const findHouseholdItemByIdHelper = async (id) => {
  return asyncHandler(async () => {
    const householdItem = await Household.findById(id);
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
    });
    return households.length > 0 ? households : false;
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
