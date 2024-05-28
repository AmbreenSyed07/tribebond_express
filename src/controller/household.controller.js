/** @format */

const {
  asyncErrorHandler,
  asyncHandler,
} = require("../helper/async-error.helper");
const {sendResponse} = require("../helper/local.helpers");
const {isNotEmpty} = require("../helper/validate.helpers");
const {
  createHouseholdItem,
  findAndUpdateHouseholdItem,
  findHouseholdItemByIdHelper,
  findHouseholdItemById,
  findHouseholdItemsByCity,
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
    let household_thumbnail = req && req.files && req.files.thumbnail;
    let household_images = req && req.files && req.files.images;

    if (!isNotEmpty(name)) {
      return sendResponse(res, 400, false, "Please enter the name.");
    } else if (!isNotEmpty(address)) {
      return sendResponse(res, 400, false, "Please enter an address.");
    } else if (!isNotEmpty(city)) {
      return sendResponse(res, 400, false, "Please enter the city.");
    } else if (!isNotEmpty(phone)) {
      return sendResponse(res, 400, false, "Please enter a contact number.");
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
      let thumbnail;
      if (household_thumbnail) {
        const newFile = await uploadAndCreateImage(
          household_thumbnail,
          "household/thumbnail",
          newHouseholdItem._id,
          res
        );
        thumbnail = newFile;
      }

      if (thumbnail) {
        let updatedHouseholdItem = await findAndUpdateHouseholdItem(
          { _id: newHouseholdItem._id },
          {
            thumbnail: thumbnail,
          }
        );
        if (!updatedHouseholdItem) {
          return sendResponse(res, 400, false, "Unable to save thumbnail.");
        }
      }
      if (household_images) {
        let imgArray = [];
        if (!household_images[0]) {
          let fileName = await uploadAndCreateImage(
            household_images,
            "household/images",
            newHouseholdItem._id,
            res
          );
          imgArray.push(fileName);
        } else {
          for (let img of household_images) {
            let fileName = await uploadAndCreateImage(
              img,
              "household/images",
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
      "household/images",
      householdId,
      res
    );
    imagePaths.push(fileName);
  } else {
    for (let file of images) {
      let fileName = await uploadAndCreateImage(
        file,
        "household/images",
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
    const householdItems = await findHouseholdItemsByCity(city);
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
    const householdItem = await findHouseholdItemByIdHelper(householdId);
    if (!householdItem) {
      return sendResponse(res, 404, false, "Household item not found");
    }

    const deleteImagePromises = imageUrls.map(async (imageUrl) => {
      const imageIdentifier = extractImageIdentifier(imageUrl);
      const deletedImage = await deleteImageFromStorage(
        imageIdentifier,
        householdId,
        "household/images"
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

module.exports = {
  addHouseholdItem,
  editHouseholdItem,
  getHouseholdItems,
  getHouseholdItemById,
  deleteImages,
  addReview,
};
