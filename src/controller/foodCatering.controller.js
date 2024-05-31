/** @format */

const {
  asyncErrorHandler,
  asyncHandler,
} = require("../helper/async-error.helper");
const { sendResponse } = require("../helper/local.helpers");
const { isNotEmpty } = require("../helper/validate.helpers");
const {
  createDiningLocation,
  findAndUpdateDiningLocation,
  findDiningLocationByIdHelper,
  findDiningLocationById,
  findDiningLocationsByCity,
  searchFoodCaterings,
} = require("../service/foodCatering.service");
const {
  extractImageIdentifier,
  deleteImageFromStorage,
  uploadAndCreateImage,
} = require("../helper/upload.helpers");

const addDiningLocation = async (req, res) => {
  return asyncErrorHandler(async () => {
    const { _id: userId } = req.tokenData;
    const {
      name,
      description,
      address,
      city,
      phone,
      email,
      foodType,
      website,
    } = req.body;
    let location_images = req && req.files && req.files.images;

    if (!isNotEmpty(name)) {
      return sendResponse(res, 400, false, "Please enter the name.");
    } else if (!isNotEmpty(address)) {
      return sendResponse(res, 400, false, "Please enter an address.");
    } else if (!isNotEmpty(city)) {
      return sendResponse(res, 400, false, "Please enter the city.");
    } else if (!isNotEmpty(phone)) {
      return sendResponse(res, 400, false, "Please enter a contact number.");
    } else if (!isNotEmpty(foodType)) {
      return sendResponse(res, 400, false, "Please enter food type.");
    }
    const info = {
      name,
      description,
      address,
      city,
      phone,
      email,
      foodType,
      website,
      createdBy: userId,
    };

    const newDiningLocation = await createDiningLocation(info);
    if (!newDiningLocation) {
      return sendResponse(
        res,
        400,
        false,
        "Unable to add new dining location."
      );
    } else {
      if (location_images) {
        let imgArray = [];
        if (!location_images[0]) {
          let fileName = await uploadAndCreateImage(
            location_images,
            "food-catering",
            newDiningLocation._id,
            res
          );
          imgArray.push(fileName);
        } else {
          for (let img of location_images) {
            let fileName = await uploadAndCreateImage(
              img,
              "food-catering",
              newDiningLocation._id,
              res
            );
            imgArray.push(fileName);
          }
        }
        let updatedDiningLocation = await findAndUpdateDiningLocation(
          { _id: newDiningLocation._id },
          {
            images: imgArray,
          }
        );
        if (!updatedDiningLocation) {
          return sendResponse(res, 400, false, "Unable to save images.");
        }
      }

      return sendResponse(
        res,
        200,
        true,
        "Successfully added new dining location.",
        newDiningLocation
      );
    }
  }, res);
};

const editDiningLocation = async (req, res) => {
  return asyncErrorHandler(async () => {
    const { id: locationId } = req.params;
    const { _id: userId } = req.tokenData;
    const {
      name,
      description,
      address,
      city,
      phone,
      email,
      foodType,
      website,
    } = req.body;

    if (req.files) {
      const { images } = req.files;
      await editImage(locationId, images, res);
    }

    const findInfo = { _id: locationId, status: true };
    const setInfo = {
      name,
      description,
      address,
      city,
      phone,
      email,
      foodType,
      website,
      updatedBy: userId,
    };

    const diningLocation = await findAndUpdateDiningLocation(findInfo, setInfo);
    if (!diningLocation) {
      return sendResponse(
        res,
        400,
        false,
        "Unable to update dining location info."
      );
    } else {
      return sendResponse(
        res,
        200,
        true,
        "Successfully updated dining location info.",
        diningLocation
      );
    }
  }, res);
};

const editImage = async (locationId, images, res) => {
  const diningLocation = await findDiningLocationByIdHelper(locationId);
  if (!diningLocation) {
    return sendResponse(res, 400, false, "Dining location not found.");
  }

  // Assuming images is an array of files
  const imagePaths = [];
  if (!images[0]) {
    let fileName = await uploadAndCreateImage(
      images,
      "food-catering",
      locationId,
      res
    );
    imagePaths.push(fileName);
  } else {
    for (let file of images) {
      let fileName = await uploadAndCreateImage(
        file,
        "food-catering",
        locationId,
        res
      );
      imagePaths.push(fileName);
    }
  }

  diningLocation.images = [...diningLocation.images, ...imagePaths];
  await diningLocation.save();
};

const getDiningLocations = async (req, res) => {
  return asyncErrorHandler(async () => {
    const { city } = req.tokenData;
    const diningLocations = await findDiningLocationsByCity(city);
    if (!diningLocations) {
      return sendResponse(res, 400, false, "No dining locations found.");
    }

    return sendResponse(
      res,
      200,
      true,
      "Successfully fetched dining locations.",
      diningLocations
    );
  }, res);
};

const getDiningLocationById = async (req, res) => {
  return asyncErrorHandler(async () => {
    let { id } = req.params;
    const diningLocation = await findDiningLocationById(id);
    if (!diningLocation) {
      return sendResponse(res, 400, false, "Dining location not found.");
    }
    return sendResponse(
      res,
      200,
      true,
      "Successfully fetched dining location.",
      diningLocation
    );
  }, res);
};

const deleteDiningLocationImages = async (req, res) => {
  return asyncErrorHandler(async () => {
    const { locationId, imageUrls } = req.body;
    const diningLocation = await findDiningLocationByIdHelper(locationId);
    if (!diningLocation) {
      return sendResponse(res, 404, false, "Dining location not found");
    }

    const deleteImagePromises = imageUrls.map(async (imageUrl) => {
      const imageIdentifier = extractImageIdentifier(imageUrl);
      const deletedImage = await deleteImageFromStorage(
        imageIdentifier,
        locationId,
        "food-catering"
      );
      diningLocation.images = diningLocation.images.filter(
        (img) => img !== imageIdentifier
      );
    });
    await Promise.all(deleteImagePromises);
    let updatedDiningLocation = await findAndUpdateDiningLocation(
      { _id: locationId },
      diningLocation
    );
    if (!updatedDiningLocation) {
      return sendResponse(res, 404, false, "Unable to save changes.");
    }
    return sendResponse(res, 200, true, "Deleted successfully.");
  }, res);
};

const addDiningLocationReview = async (req, res) => {
  return asyncErrorHandler(async () => {
    const { _id: userId } = req.tokenData;
    const { locationId, review } = req.body;
    if (!isNotEmpty(review)) {
      return sendResponse(res, 400, false, "Please write a review.");
    }
    const diningLocation = await findDiningLocationByIdHelper(locationId);
    if (!diningLocation) {
      return sendResponse(res, 404, false, "Dining location not found.");
    }
    const newReview = { user: userId, reviewText: review };
    diningLocation.reviews.unshift(newReview);
    await diningLocation.save();
    return sendResponse(res, 200, true, "Successfully added your review.");
  }, res);
};

const searchFoodCatering = async (req, res) => {
  return asyncErrorHandler(async () => {
    const { query } = req.body;

    if (!query) {
      return sendResponse(res, 400, false, "Query parameter is required.");
    }

    const foodCaterings = await searchFoodCaterings(query);
    if (!foodCaterings || foodCaterings.length === 0) {
      return sendResponse(res, 404, false, "No food caterings found.");
    }

    return sendResponse(
      res,
      200,
      true,
      "Successfully fetched food caterings.",
      foodCaterings
    );
  }, res);
};

module.exports = {
  addDiningLocation,
  editDiningLocation,
  getDiningLocations,
  getDiningLocationById,
  deleteDiningLocationImages,
  addDiningLocationReview,
  searchFoodCatering,
};
