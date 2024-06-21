const {
  asyncErrorHandler,
  asyncHandler,
} = require("../helper/async-error.helper");
const { sendResponse } = require("../helper/local.helpers");
const { isNotEmpty, isPhoneNo } = require("../helper/validate.helpers");
const {
  createRestaurant,
  findAndUpdateRestaurant,
  findRestaurantByIdHelper,
  findRestaurantById,
  findRestaurantsByCity,
  searchHalalRestaurants,
} = require("../service/halalRestaurant.service");
const {
  extractImageIdentifier,
  deleteImageFromStorage,
  uploadAndCreateImage,
} = require("../helper/upload.helpers");

const addRestaurant = async (req, res) => {
  return asyncErrorHandler(async () => {
    const { _id: userId } = req.tokenData;
    const { name, description, address, city, phone, website } = req.body;
    let restaurant_images = req && req.files && req.files.images;

    if (!isNotEmpty(name)) {
      return sendResponse(
        res,
        400,
        false,
        "Please enter the restaurant's name."
      );
    } else if (!isNotEmpty(address)) {
      return sendResponse(
        res,
        400,
        false,
        "Please enter an address for the restaurant."
      );
    } else if (!isNotEmpty(city)) {
      return sendResponse(
        res,
        400,
        false,
        "Please enter a city for the restaurant."
      );
    } else if (!isNotEmpty(phone) || !isPhoneNo(phone)) {
      return sendResponse(
        res,
        400,
        false,
        "Please enter a valid contact number for the restaurant."
      );
    } else if (!isNotEmpty(website)) {
      return sendResponse(
        res,
        400,
        false,
        "Please enter a valid website url for the restaurant."
      );
    } else if (!restaurant_images || restaurant_images.length <= 0) {
      return sendResponse(
        res,
        400,
        false,
        "Please select images for the restaurant."
      );
    }

    const info = {
      name,
      description,
      address,
      city,
      phone,
      website,
      createdBy: userId,
    };

    const newRestaurant = await createRestaurant(info);
    if (!newRestaurant) {
      return sendResponse(res, 400, false, "Unable to add new restaurant.");
    } else {
      if (restaurant_images) {
        let imgArray = [];
        if (!restaurant_images[0]) {
          let fileName = await uploadAndCreateImage(
            restaurant_images,
            "restaurant",
            newRestaurant._id,
            res
          );
          imgArray.push(fileName);
        } else {
          for (let img of restaurant_images) {
            let fileName = await uploadAndCreateImage(
              img,
              "restaurant",
              newRestaurant._id,
              res
            );
            imgArray.push(fileName);
          }
        }
        let updatedRestaurant = await findAndUpdateRestaurant(
          { _id: newRestaurant._id },
          {
            images: imgArray,
          }
        );
        if (!updatedRestaurant) {
          return sendResponse(res, 400, false, "Unable to save images.");
        }
      }

      return sendResponse(
        res,
        200,
        true,
        "Successfully added restaurant.",
        newRestaurant
      );
    }
  }, res);
};

const editRestaurant = async (req, res) => {
  return asyncErrorHandler(async () => {
    const { id: restroId } = req.params;
    const { _id: userId } = req.tokenData;
    const { name, description, address, city, phone, website } = req.body;

    const checkRestaurant = await findRestaurantByIdHelper(restroId);
    if (!checkRestaurant) {
      return sendResponse(res, 404, false, "Restaurant not found");
    }

    // Check if the Beauty record's createdBy is equal to the user's id
    if (checkRestaurant.createdBy.toString() !== userId.toString()) {
      return sendResponse(
        res,
        403,
        false,
        "You are not authorized to edit this restaurant record."
      );
    }

    if (!isNotEmpty(name)) {
      return sendResponse(
        res,
        400,
        false,
        "Please enter the restaurant's name."
      );
    } else if (!isNotEmpty(address)) {
      return sendResponse(
        res,
        400,
        false,
        "Please enter an address for the restaurant."
      );
    } else if (!isNotEmpty(city)) {
      return sendResponse(
        res,
        400,
        false,
        "Please enter a city for the restaurant."
      );
    } else if (!isNotEmpty(phone) || !isPhoneNo(phone)) {
      return sendResponse(
        res,
        400,
        false,
        "Please enter a valid contact number for the restaurant."
      );
    } else if (!isNotEmpty(website)) {
      return sendResponse(
        res,
        400,
        false,
        "Please enter a valid website url for the restaurant."
      );
    }

    if (req.files) {
      const { images } = req.files;
      await editImage(restroId, images, res);
    }

    const findInfo = { _id: restroId, status: true };
    const setInfo = {
      name,
      description,
      address,
      city,
      phone,
      website,
      updatedBy: userId,
    };

    const restaurant = await findAndUpdateRestaurant(findInfo, setInfo);
    if (!restaurant) {
      return sendResponse(res, 400, false, "Unable to update restaurant info.");
    } else {
      return sendResponse(
        res,
        200,
        true,
        "Successfully updated restaurant info.",
        restaurant
      );
    }
  }, res);
};

const editImage = async (restroId, images, res) => {
  const restaurant = await findRestaurantByIdHelper(restroId);
  if (!restaurant) {
    return sendResponse(res, 400, false, "Restaurant not found.");
  }

  // Assuming images is an array of files
  const imagePaths = [];
  if (!images[0]) {
    let fileName = await uploadAndCreateImage(
      images,
      "restaurant",
      restroId,
      res
    );
    imagePaths.push(fileName);
  } else {
    for (let file of images) {
      let fileName = await uploadAndCreateImage(
        file,
        "restaurant",
        restroId,
        res
      );
      imagePaths.push(fileName);
    }
  }

  restaurant.images = [...restaurant.images, ...imagePaths];
  await restaurant.save();
};

const getRestaurants = async (req, res) => {
  return asyncErrorHandler(async () => {
    const { city } = req.tokenData;
    const { query } = req.query;

    let restaurants;
    if (query) {
      // If query parameter is present, use the search service
      restaurants = await searchHalalRestaurants(query);
    } else {
      // Otherwise, use the findrestaurantsByCity service
      restaurants = await findRestaurantsByCity(city);
    }

    if (!restaurants) {
      return sendResponse(res, 400, false, "No restaurants found.");
    }

    return sendResponse(
      res,
      200,
      true,
      "Successfully fetched restaurants.",
      restaurants
    );
  }, res);
};

const getRestaurantById = async (req, res) => {
  return asyncErrorHandler(async () => {
    let { id } = req.params;
    const restaurant = await findRestaurantById(id);
    if (!restaurant) {
      return sendResponse(res, 400, false, "Restaurant not found.");
    }
    return sendResponse(
      res,
      200,
      true,
      "Successfully fetched restaurant.",
      restaurant
    );
  }, res);
};

const deleteImages = async (req, res) => {
  return asyncErrorHandler(async () => {
    const { restaurantId, imageUrls } = req.body;
    const { _id: userId } = req.tokenData;
    const restaurant = await findRestaurantByIdHelper(restaurantId);
    if (!restaurant) {
      return sendResponse(res, 404, false, "Restaurant not found");
    }

    // Check if the Beauty record's createdBy is equal to the user's id
    if (restaurant.createdBy.toString() !== userId.toString()) {
      return sendResponse(
        res,
        403,
        false,
        "You are not authorized to edit this restaurant record."
      );
    }

    const deleteImagePromises = imageUrls.map(async (imageUrl) => {
      const imageIdentifier = extractImageIdentifier(imageUrl);
      const deletedImage = await deleteImageFromStorage(
        imageIdentifier,
        restaurantId,
        "restaurant"
      );
      restaurant.images = restaurant.images.filter(
        (img) => img !== imageIdentifier
      );
    });
    await Promise.all(deleteImagePromises);
    let updatedRestaurant = await findAndUpdateRestaurant(
      { _id: restaurantId },
      restaurant
    ); //will update the existing event, as event is an instance of existing one
    if (!updatedRestaurant) {
      return sendResponse(res, 404, false, "Unable to save changes.");
    }
    return sendResponse(res, 200, true, "Deleted successfully.");
  }, res);
};

const addReview = async (req, res) => {
  return asyncErrorHandler(async () => {
    const { _id: userId } = req.tokenData;
    const { restaurantId, review } = req.body;
    if (!isNotEmpty(review)) {
      return sendResponse(res, 400, false, "Please write a review.");
    }
    const restaurant = await findRestaurantByIdHelper(restaurantId);
    if (!restaurant) {
      return sendResponse(res, 404, false, "Restaurant not found");
    }
    const newReview = { user: userId, reviewText: review };
    restaurant.reviews.unshift(newReview);
    await restaurant.save();
    return sendResponse(res, 200, true, "Successfully added your review.");
  }, res);
};

const searchHalalRestaurant = async (req, res) => {
  return asyncErrorHandler(async () => {
    const { query } = req.body;

    if (!query) {
      return sendResponse(res, 400, false, "Query parameter is required.");
    }

    const halalRestaurants = await searchHalalRestaurants(query);
    if (!halalRestaurants || halalRestaurants.length === 0) {
      return sendResponse(res, 404, false, "No halal restaurants found.");
    }

    return sendResponse(
      res,
      200,
      true,
      "Successfully fetched halal restaurants.",
      halalRestaurants
    );
  }, res);
};

module.exports = {
  addRestaurant,
  editRestaurant,
  getRestaurants,
  getRestaurantById,
  deleteImages,
  addReview,
  searchHalalRestaurant,
};
