const { asyncHandler } = require("../helper/async-error.helper");
const { base_url, modifyResponse } = require("../helper/local.helpers");
const HalalRestaurant = require("../model/halalRestaurant.model");

const createRestaurant = async (info) => {
  return asyncHandler(async () => {
    const restaurant = new HalalRestaurant(info);

    const savedRestaurant = await restaurant.save();
    return savedRestaurant instanceof HalalRestaurant
      ? savedRestaurant.toJSON()
      : false;
  });
};

const findAndUpdateRestaurant = async (findInfo, setInfo) => {
  return asyncHandler(async () => {
    const restaurant = await HalalRestaurant.findOneAndUpdate(
      findInfo, // Match both ID and Type
      {
        $set: setInfo,
      },
      { new: true, runValidators: true } // Options to return the updated document and run schema validators
    );
    return restaurant ? restaurant : false;
  });
};

const findRestaurantById = async (id) => {
  return asyncHandler(async () => {
    const restaurant = await HalalRestaurant.findById({
      _id: id,
      status: true,
    })
      .populate("reviews.user", "firstName lastName profilePicture")
      .populate("createdBy", "firstName lastName profilePicture");
    // if (restaurant) {
    //   let restaurantObj = restaurant.toObject();
    //   restaurantObj?.reviews &&
    //     restaurantObj?.reviews.length > 0 &&
    //     restaurantObj?.reviews.forEach((review) => {
    //       if (
    //         review.user &&
    //         review.user.profilePicture &&
    //         !review.user.profilePicture.startsWith(base_url)
    //       ) {
    //         review.user.profilePicture = `${base_url}public/data/profile/${review.user._id}/${review.user.profilePicture}`;
    //       }
    //     });

    //   if (restaurantObj.images && restaurantObj.images.length > 0) {
    //     restaurantObj.images = restaurantObj.images.map((img) => {
    //       return `${base_url}public/data/restaurant/${restaurantObj._id}/${img}`;
    //     });
    //   }
    //   return restaurantObj;
    // } else {
    //   return false;
    // }
    return restaurant ? modifyResponse([restaurant], "restaurant") : false;
  });
};

const findRestaurantsByCity = async (city) => {
  return asyncHandler(async () => {
    const restaurants = await HalalRestaurant.find({
      city: { $regex: `^${city}$`, $options: "i" },
      status: true,
    })
      .collation({ locale: "en", strength: 2 })
      .populate("reviews.user", "firstName lastName profilePicture")
      .populate("createdBy", "firstName lastName profilePicture")
      .exec();
    return restaurants.length > 0
      ? modifyResponse(restaurants, "restaurant")
      : false;
    // if (restaurants.length > 0) {
    //   const modifiedRestaurants = restaurants.map((restaurant) => {
    //     let restaurantObj = restaurant.toObject();

    //     restaurantObj?.reviews &&
    //       restaurantObj?.reviews.length > 0 &&
    //       restaurantObj?.reviews.forEach((review) => {
    //         if (
    //           review.user &&
    //           review.user.profilePicture &&
    //           !review.user.profilePicture.startsWith(base_url)
    //         ) {
    //           review.user.profilePicture = `${base_url}public/data/profile/${review.user._id}/${review.user.profilePicture}`;
    //         }
    //       });

    //     if (restaurantObj.images && restaurantObj.images.length > 0) {
    //       restaurantObj.images = restaurantObj.images.map((img) => {
    //         return `${base_url}public/data/restaurant/${restaurantObj._id}/${img}`;
    //       });
    //     }
    //     return restaurantObj;
    //   });
    //   return modifiedRestaurants;
    // } else {
    //   return false;
    // }
  });
};

const findRestaurantByIdHelper = async (id) => {
  return asyncHandler(async () => {
    const restaurant = await HalalRestaurant.findOne({ _id: id, status: true });
    return restaurant ? restaurant : false;
  });
};

const searchHalalRestaurants = async (query) => {
  return asyncHandler(async () => {
    const halalRestaurants = await HalalRestaurant.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { city: { $regex: query, $options: "i" } },
      ],
      status: true,
    })
      .populate("reviews.user", "firstName lastName profilePicture")
      .populate("createdBy", "firstName lastName profilePicture")
      .exec();
    return halalRestaurants.length > 0
      ? modifyResponse(halalRestaurants, "restaurant")
      : false;
  });
};

module.exports = {
  createRestaurant,
  findAndUpdateRestaurant,
  findRestaurantsByCity,
  findRestaurantById,
  findRestaurantByIdHelper,
  searchHalalRestaurants,
};
