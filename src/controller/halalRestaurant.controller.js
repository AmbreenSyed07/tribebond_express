const {
  asyncErrorHandler,
  asyncHandler,
} = require("../helper/async-error.helper");
const { sendResponse } = require("../helper/local.helpers");
const { isNotEmpty } = require("../helper/validate.helpers");
const {
  createRestaurant,
  findAndUpdateRestaurant,
  findEventByCity,
  findEventById,
  findEventByIdHelper,
  findRestaurantByIdHelper,
  findRestaurantById,
  findRestaurantsByCity,
} = require("../service/halalRestaurant.service");
const {
  extractImageIdentifier,
  deleteImageFromStorage,
  uploadAndCreateImage,
} = require("../helper/upload.helpers");
const Event = require("../model/events.model");
const HalalRestaurant = require("../model/halalRestaurant.model");

const addRestaurant = async (req, res) => {
  return asyncErrorHandler(async () => {
    const { _id: userId } = req.tokenData._doc;
    const { name, description, address, city, phone, website } = req.body;
    let restaurant_thumbnail = req && req.files && req.files.thumbnail;
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
    } else if (!isNotEmpty(phone)) {
      return sendResponse(
        res,
        400,
        false,
        "Please enter a contact number for the restaurant."
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
      let thumbnail;
      if (restaurant_thumbnail) {
        const newFile = await uploadAndCreateImage(
          restaurant_thumbnail,
          "restaurant/thumbnail",
          newRestaurant._id,
          res
        );
        thumbnail = newFile;
      }

      if (thumbnail) {
        let updatedRestaurant = await findAndUpdateRestaurant(
          { _id: newRestaurant._id },
          {
            thumbnail: thumbnail,
          }
        );
        if (!updatedRestaurant) {
          return sendResponse(res, 400, false, "Unable to save thumbnail.");
        }
      }
      if (restaurant_images) {
        let imgArray = [];
        if (!restaurant_images[0]) {
          let fileName = await uploadAndCreateImage(
            restaurant_images,
            "restaurant/images",
            newRestaurant._id,
            res
          );
          imgArray.push(fileName);
        } else {
          for (let img of restaurant_images) {
            let fileName = await uploadAndCreateImage(
              img,
              "restaurant/images",
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
    const { _id: userId } = req.tokenData._doc;
    const { name, description, address, city, phone, website } = req.body;

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
      "restaurant/images",
      restroId,
      res
    );
    imagePaths.push(fileName);
  } else {
    for (let file of images) {
      let fileName = await uploadAndCreateImage(
        file,
        "restaurant/images",
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
    const { city } = req.tokenData._doc;
    const restaurants = await findRestaurantsByCity(city);
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
    const restaurant = await findRestaurantByIdHelper(restaurantId);
    if (!restaurant) {
      return sendResponse(res, 404, false, "Restaurant not found");
    }

    const deleteImagePromises = imageUrls.map(async (imageUrl) => {
      const imageIdentifier = extractImageIdentifier(imageUrl);
      const deletedImage = await deleteImageFromStorage(
        imageIdentifier,
        restaurantId,
        "restaurant/images"
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
    const { _id: userId } = req.tokenData._doc;
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

module.exports = {
  addRestaurant,
  editRestaurant,
  getRestaurants,
  getRestaurantById,
  deleteImages,
  addReview,
};
