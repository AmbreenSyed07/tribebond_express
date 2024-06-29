/** @format */

const { asyncErrorHandler } = require("../helper/async-error.helper");
const { sendResponse } = require("../helper/local.helpers");
const {
  isNotEmpty,
  isPhoneNo,
  isWebsite,
} = require("../helper/validate.helpers");
const {
  createHouseholdItem,
  findAndUpdateHouseholdItem,
  findHouseholdItemByIdHelper,
  findHouseholdItemById,
  findHouseholdItemsByCity,
  searchHouseholds,
} = require("../service/household.service");
const {
  extractImageIdentifier,
  deleteImageFromStorage,
  uploadAndCreateImage,
} = require("../helper/upload.helpers");

const addHouseholdItem = async (req, res) => {
  return asyncErrorHandler(async () => {
    const { _id: userId } = req.tokenData;
    const { name, description, address, city, phone, website } = req.body;
    let household_images = req && req.files && req.files.images;

    if (!isNotEmpty(name)) {
      return sendResponse(res, 400, false, "Please enter the name.");
    } else if (!isNotEmpty(address)) {
      return sendResponse(res, 400, false, "Please enter an address.");
    } else if (!isNotEmpty(city)) {
      return sendResponse(res, 400, false, "Please enter the city.");
    } else if (!isNotEmpty(phone) || !isPhoneNo(phone)) {
      return sendResponse(res, 400, false, "Please enter a contact number.");
    } else if (!isWebsite(website)) {
      return sendResponse(res, 400, false, "Please enter a valid website url.");
    } else if (!household_images || household_images.length <= 0) {
      return sendResponse(res, 400, false, "Please select images.");
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

    const newHouseholdItem = await createHouseholdItem(info);
    if (!newHouseholdItem) {
      return sendResponse(res, 400, false, "Unable to add new household item.");
    } else {
      if (household_images) {
        let imgArray = [];
        if (!household_images[0]) {
          let fileName = await uploadAndCreateImage(
            household_images,
            "household",
            newHouseholdItem._id,
            res
          );
          imgArray.push(fileName);
        } else {
          for (let img of household_images) {
            let fileName = await uploadAndCreateImage(
              img,
              "household",
              newHouseholdItem._id,
              res
            );
            imgArray.push(fileName);
          }
        }
        let updatedHouseholdItem = await findAndUpdateHouseholdItem(
          { _id: newHouseholdItem._id },
          {
            images: imgArray,
          }
        );
        if (!updatedHouseholdItem) {
          return sendResponse(res, 400, false, "Unable to save images.");
        }
      }

      return sendResponse(
        res,
        200,
        true,
        "Successfully added new household item.",
        newHouseholdItem
      );
    }
  }, res);
};

const editHouseholdItem = async (req, res) => {
  return asyncErrorHandler(async () => {
    const { id: householdId } = req.params;
    const { _id: userId } = req.tokenData;
    const { name, description, address, city, phone, website } = req.body;

    if (!householdId) {
      return sendResponse(res, 400, false, "Please select a record id.");
    }

    const checkHousehold = await findHouseholdItemByIdHelper(householdId);
    if (!checkHousehold) {
      return sendResponse(res, 404, false, "Household item not found");
    }

    if (checkHousehold.createdBy.toString() !== userId.toString()) {
      return sendResponse(
        res,
        403,
        false,
        "You are not authorized to edit this Household item."
      );
    }

    if (!isNotEmpty(name)) {
      return sendResponse(res, 400, false, "Please enter the name.");
    } else if (!isNotEmpty(address)) {
      return sendResponse(res, 400, false, "Please enter an address.");
    } else if (!isNotEmpty(city)) {
      return sendResponse(res, 400, false, "Please enter the city.");
    } else if (!isNotEmpty(phone) || !isPhoneNo(phone)) {
      return sendResponse(
        res,
        400,
        false,
        "Please enter a valid contact number."
      );
    } else if (!isWebsite(website)) {
      return sendResponse(res, 400, false, "Please enter a valid website url.");
    }

    if (req.files) {
      const { images } = req.files;
      await editImage(householdId, images, res);
    }

    const findInfo = { _id: householdId, status: true };
    const setInfo = {
      name,
      description,
      address,
      city,
      phone,
      website,
      updatedBy: userId,
    };

    const householdItem = await findAndUpdateHouseholdItem(findInfo, setInfo);
    if (!householdItem) {
      return sendResponse(
        res,
        400,
        false,
        "Unable to update household item info."
      );
    } else {
      return sendResponse(
        res,
        200,
        true,
        "Successfully updated household item info.",
        householdItem
      );
    }
  }, res);
};

const editImage = async (householdId, images, res) => {
  const householdItem = await findHouseholdItemByIdHelper(householdId);
  if (!householdItem) {
    return sendResponse(res, 400, false, "Household item not found.");
  }

  // Assuming images is an array of files
  const imagePaths = [];
  if (!images[0]) {
    let fileName = await uploadAndCreateImage(
      images,
      "household",
      householdId,
      res
    );
    imagePaths.push(fileName);
  } else {
    for (let file of images) {
      let fileName = await uploadAndCreateImage(
        file,
        "household",
        householdId,
        res
      );
      imagePaths.push(fileName);
    }
  }

  householdItem.images = [...householdItem.images, ...imagePaths];
  await householdItem.save();
};

const getHouseholdItems = async (req, res) => {
  return asyncErrorHandler(async () => {
    const { city } = req.tokenData;
    const { query } = req.query;

    let householdItems;
    if (query) {
      householdItems = await searchHouseholds(query);
    } else {
      householdItems = await findHouseholdItemsByCity(city);
    }

    if (!householdItems) {
      return sendResponse(res, 400, false, "No household items found.");
    }

    return sendResponse(
      res,
      200,
      true,
      "Successfully fetched household items.",
      householdItems
    );
  }, res);
};

const getHouseholdItemById = async (req, res) => {
  return asyncErrorHandler(async () => {
    let { id } = req.params;
    if (!id) {
      return sendResponse(res, 400, false, "Please select a record id.");
    }
    const householdItem = await findHouseholdItemById(id);
    if (!householdItem) {
      return sendResponse(res, 400, false, "Household item not found.");
    }
    return sendResponse(
      res,
      200,
      true,
      "Successfully fetched household item.",
      householdItem
    );
  }, res);
};

const deleteImages = async (req, res) => {
  return asyncErrorHandler(async () => {
    const { householdId, imageUrls } = req.body;
    const { _id: userId } = req.tokenData;

    if (!householdId) {
      return sendResponse(res, 400, false, "Please select a record id.");
    }

    const householdItem = await findHouseholdItemByIdHelper(householdId);
    if (!householdItem) {
      return sendResponse(res, 404, false, "Household item not found");
    }
    if (householdItem.createdBy.toString() !== userId.toString()) {
      return sendResponse(
        res,
        403,
        false,
        "You are not authorized to edit this record."
      );
    } else if (!imageUrls || imageUrls.length <= 0) {
      return sendResponse(res, 400, false, "Please select images to delete.");
    }

    const deleteImagePromises = imageUrls.map(async (imageUrl) => {
      const imageIdentifier = extractImageIdentifier(imageUrl);
      const deletedImage = await deleteImageFromStorage(
        imageIdentifier,
        householdId,
        "household"
      );
      householdItem.images = householdItem.images.filter(
        (img) => img !== imageIdentifier
      );
    });
    await Promise.all(deleteImagePromises);
    let updatedHouseholdItem = await findAndUpdateHouseholdItem(
      { _id: householdId },
      householdItem
    );
    if (!updatedHouseholdItem) {
      return sendResponse(res, 404, false, "Unable to save changes.");
    }
    return sendResponse(res, 200, true, "Deleted successfully.");
  }, res);
};

const addReview = async (req, res) => {
  return asyncErrorHandler(async () => {
    const { _id: userId } = req.tokenData;
    const { householdId, review } = req.body;

    if (!householdId) {
      return sendResponse(res, 400, false, "Please select a record id.");
    }
    if (!isNotEmpty(review)) {
      return sendResponse(res, 400, false, "Please write a review.");
    }
    const householdItem = await findHouseholdItemByIdHelper(householdId);
    if (!householdItem) {
      return sendResponse(res, 404, false, "Household item not found.");
    }
    const newReview = { user: userId, reviewText: review };
    householdItem.reviews.unshift(newReview);
    await householdItem.save();
    return sendResponse(res, 200, true, "Successfully added your review.");
  }, res);
};

const searchHousehold = async (req, res) => {
  return asyncErrorHandler(async () => {
    const { query } = req.body;

    if (!query) {
      return sendResponse(res, 400, false, "Query parameter is required.");
    }

    const households = await searchHouseholds(query);
    if (!households || households.length === 0) {
      return sendResponse(res, 404, false, "No households found.");
    }

    return sendResponse(
      res,
      200,
      true,
      "Successfully fetched households.",
      households
    );
  }, res);
};

const deleteHousehold = async (req, res) => {
  return asyncErrorHandler(async () => {
    const { id } = req.params;
    const { _id: userId } = req.tokenData;

    const household = await findHouseholdItemByIdHelper(id);
    if (!household) {
      return sendResponse(res, 404, false, "Record not found");
    }
    if (household.createdBy.toString() !== userId.toString()) {
      return sendResponse(
        res,
        403,
        false,
        "You are not authorized to delete this record."
      );
    }

    const deletedHousehold = await findAndUpdateHouseholdItem(
      { _id: id },
      {
        status: false,
        updatedBy: userId,
      }
    );
    if (!deletedHousehold) {
      return sendResponse(
        res,
        403,
        false,
        "Some error occurred, please try again later."
      );
    }

    return sendResponse(res, 200, true, "Successfully deleted record.");
  }, res);
};

module.exports = {
  addHouseholdItem,
  editHouseholdItem,
  getHouseholdItems,
  getHouseholdItemById,
  deleteImages,
  addReview,
  searchHousehold,
  deleteHousehold,
};
