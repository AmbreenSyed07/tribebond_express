/** @format */

const { asyncErrorHandler } = require("../helper/async-error.helper");
const { sendResponse } = require("../helper/local.helpers");
const { isNotEmpty, isPhoneNo } = require("../helper/validate.helpers");
const {
  createGiveawayItem,
  findAndUpdateGiveawayItem,
  findGiveawayItemByIdHelper,
  findGiveawayItemById,
  findGiveawayItemsByCity,
  searchGiveaways,
} = require("../service/freeGiveaway.service");
const {
  extractImageIdentifier,
  deleteImageFromStorage,
  uploadAndCreateImage,
} = require("../helper/upload.helpers");

const addGiveawayItem = async (req, res) => {
  return asyncErrorHandler(async () => {
    const { _id: userId } = req.tokenData;
    const { name, description, address, city, phone, contactEmail, category } =
      req.body;
    let giveaway_images = req && req.files && req.files.images;

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
    } else if (!isNotEmpty(contactEmail)) {
      return sendResponse(res, 400, false, "Please enter your email.");
    } else if (!isNotEmpty(category)) {
      return sendResponse(res, 400, false, "Please select a category.");
    } else if (!giveaway_images || giveaway_images.length <= 0) {
      return sendResponse(res, 400, false, "Please select images.");
    }

    const info = {
      name,
      description,
      address,
      city,
      phone,
      contactEmail,
      category,
      createdBy: userId,
    };

    const newGiveawayItem = await createGiveawayItem(info);
    if (!newGiveawayItem) {
      return sendResponse(res, 400, false, "Unable to add new giveaway item.");
    } else {
      if (giveaway_images) {
        let imgArray = [];
        if (!giveaway_images[0]) {
          let fileName = await uploadAndCreateImage(
            giveaway_images,
            "giveaway/images",
            newGiveawayItem._id,
            res
          );
          imgArray.push(fileName);
        } else {
          for (let img of giveaway_images) {
            let fileName = await uploadAndCreateImage(
              img,
              "giveaway/images",
              newGiveawayItem._id,
              res
            );
            imgArray.push(fileName);
          }
        }
        let updatedGiveawayItem = await findAndUpdateGiveawayItem(
          { _id: newGiveawayItem._id },
          {
            images: imgArray,
          }
        );
        if (!updatedGiveawayItem) {
          return sendResponse(res, 400, false, "Unable to save images.");
        }
      }

      return sendResponse(
        res,
        200,
        true,
        "Successfully added new giveaway item.",
        newGiveawayItem
      );
    }
  }, res);
};

const editGiveawayItem = async (req, res) => {
  return asyncErrorHandler(async () => {
    const { id: giveawayId } = req.params;
    const { _id: userId } = req.tokenData;
    const { name, description, address, city, phone, contactEmail, category } =
      req.body;

    const checkGiveaway = await findGiveawayItemByIdHelper(giveawayId);
    if (!checkGiveaway) {
      return sendResponse(res, 404, false, "Giveaway item not found");
    }

    if (checkGiveaway.createdBy.toString() !== userId.toString()) {
      return sendResponse(
        res,
        403,
        false,
        "You are not authorized to edit this record."
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
    } else if (!isNotEmpty(contactEmail)) {
      return sendResponse(res, 400, false, "Please enter your email.");
    } else if (!isNotEmpty(category)) {
      return sendResponse(res, 400, false, "Please select a category.");
    }

    if (req.files) {
      const { images } = req.files;
      await editImage(giveawayId, images, res);
    }

    const findInfo = { _id: giveawayId, status: true };
    const setInfo = {
      name,
      description,
      address,
      city,
      phone,
      contactEmail,
      category,
      updatedBy: userId,
    };

    const giveawayItem = await findAndUpdateGiveawayItem(findInfo, setInfo);
    if (!giveawayItem) {
      return sendResponse(
        res,
        400,
        false,
        "Unable to update giveaway item info."
      );
    } else {
      return sendResponse(
        res,
        200,
        true,
        "Successfully updated giveaway item info.",
        giveawayItem
      );
    }
  }, res);
};

const editImage = async (giveawayId, images, res) => {
  const giveawayItem = await findGiveawayItemByIdHelper(giveawayId);
  if (!giveawayItem) {
    return sendResponse(res, 400, false, "Giveaway item not found.");
  }

  // Assuming images is an array of files
  const imagePaths = [];
  if (!images[0]) {
    let fileName = await uploadAndCreateImage(
      images,
      "giveaway/images",
      giveawayId,
      res
    );
    imagePaths.push(fileName);
  } else {
    for (let file of images) {
      let fileName = await uploadAndCreateImage(
        file,
        "giveaway/images",
        giveawayId,
        res
      );
      imagePaths.push(fileName);
    }
  }

  giveawayItem.images = [...giveawayItem.images, ...imagePaths];
  await giveawayItem.save();
};

const getGiveawayItems = async (req, res) => {
  return asyncErrorHandler(async () => {
    const { city } = req.tokenData;
    const { query } = req.query;

    let giveawayItems;
    if (query) {
      giveawayItems = await searchGiveaways(query);
    } else {
      giveawayItems = await findGiveawayItemsByCity(city);
    }
    if (!giveawayItems) {
      return sendResponse(res, 400, false, "No giveaway items found.");
    }

    return sendResponse(
      res,
      200,
      true,
      "Successfully fetched giveaway items.",
      giveawayItems
    );
  }, res);
};

const getGiveawayItemById = async (req, res) => {
  return asyncErrorHandler(async () => {
    let { id } = req.params;
    const giveawayItem = await findGiveawayItemById(id);
    if (!giveawayItem) {
      return sendResponse(res, 400, false, "Giveaway item not found.");
    }
    return sendResponse(
      res,
      200,
      true,
      "Successfully fetched giveaway item.",
      giveawayItem
    );
  }, res);
};

const deleteImages = async (req, res) => {
  return asyncErrorHandler(async () => {
    const { giveawayId, imageUrls } = req.body;
    const { _id: userId } = req.tokenData;
    const giveawayItem = await findGiveawayItemByIdHelper(giveawayId);
    if (!giveawayItem) {
      return sendResponse(res, 404, false, "Giveaway item not found");
    }
    if (giveawayItem.createdBy.toString() !== userId.toString()) {
      return sendResponse(
        res,
        403,
        false,
        "You are not authorized to edit this record."
      );
    }

    const deleteImagePromises = imageUrls.map(async (imageUrl) => {
      const imageIdentifier = extractImageIdentifier(imageUrl);
      const deletedImage = await deleteImageFromStorage(
        imageIdentifier,
        giveawayId,
        "giveaway/images"
      );
      giveawayItem.images = giveawayItem.images.filter(
        (img) => img !== imageIdentifier
      );
    });
    await Promise.all(deleteImagePromises);
    let updatedGiveawayItem = await findAndUpdateGiveawayItem(
      { _id: giveawayId },
      giveawayItem
    );
    if (!updatedGiveawayItem) {
      return sendResponse(res, 404, false, "Unable to save changes.");
    }
    return sendResponse(res, 200, true, "Deleted successfully.");
  }, res);
};

const addReview = async (req, res) => {
  return asyncErrorHandler(async () => {
    const { _id: userId } = req.tokenData;
    const { giveawayId, review } = req.body;
    if (!isNotEmpty(review)) {
      return sendResponse(res, 400, false, "Please write a review.");
    }
    const giveawayItem = await findGiveawayItemByIdHelper(giveawayId);
    if (!giveawayItem) {
      return sendResponse(res, 404, false, "Giveaway item not found.");
    }
    const newReview = { user: userId, reviewText: review };
    giveawayItem.reviews.unshift(newReview);
    await giveawayItem.save();
    return sendResponse(res, 200, true, "Successfully added your review.");
  }, res);
};

const deleteGiveaway = async (req, res) => {
  return asyncErrorHandler(async () => {
    const { id } = req.params;
    const { _id: userId } = req.tokenData;

    const giveaway = await findGiveawayItemByIdHelper({
      _id: id,
      status: true,
    });
    if (!giveaway) {
      return sendResponse(res, 404, false, "Giveaway not found");
    }
    if (giveaway.createdBy.toString() !== userId.toString()) {
      return sendResponse(
        res,
        403,
        false,
        "You are not authorized to delete this record."
      );
    }

    const deleteGiveaway = await findAndUpdateGiveawayItem(
      { _id: id },
      {
        status: false,
        updatedBy: userId,
      }
    );
    if (!deleteGiveaway) {
      return sendResponse(
        res,
        403,
        false,
        "Some error occured, please try again later."
      );
    }

    return sendResponse(res, 200, true, "Successfully deleted record.");
  }, res);
};

module.exports = {
  addGiveawayItem,
  editGiveawayItem,
  getGiveawayItems,
  getGiveawayItemById,
  deleteImages,
  addReview,
  deleteGiveaway,
};
