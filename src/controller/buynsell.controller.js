/** @format */

const { asyncErrorHandler } = require("../helper/async-error.helper");
const { sendResponse } = require("../helper/local.helpers");
const {
  createBuyNSell,
  findAndUpdateBuyNSell,
  findBuyNSellByIdHelper,
  findBuyNSellByLocation,
  findBuyNSellById,
} = require("../service/buynsell.service");
const { isNotEmpty } = require("../helper/validate.helpers");
const {
  uploadAndCreateImage,
  extractImageIdentifier,
  deleteImageFromStorage,
} = require("../helper/upload.helpers");

const addBuyNSell = async (req, res) => {
  return asyncErrorHandler(async () => {
    const { _id: userId } = req.tokenData;
    const {
      name,
      description,
      location,
      price,
      category,
      phone,
      contactEmail,
    } = req.body;
    let buyNSellImages = req && req.files && req.files.images;

    if (!isNotEmpty(name)) {
      return sendResponse(res, 400, false, "Please enter the name.");
    } else if (!isNotEmpty(location)) {
      return sendResponse(res, 400, false, "Please enter the location.");
    } else if (!isNotEmpty(price)) {
      return sendResponse(res, 400, false, "Please enter the price.");
    } else if (!isNotEmpty(category)) {
      return sendResponse(res, 400, false, "Please enter the category.");
    } else if (!isNotEmpty(phone)) {
      return sendResponse(res, 400, false, "Please enter a contact number.");
    } else if (!isNotEmpty(contactEmail)) {
      return sendResponse(res, 400, false, "Please enter your email.");
    }

    const info = {
      name,
      description,
      location,
      price,
      category,
      phone,
      contactEmail,
      createdBy: userId,
    };

    const newBuyNSell = await createBuyNSell(info);
    if (!newBuyNSell) {
      return sendResponse(res, 400, false, "Unable to add new item.");
    } else {
      if (buyNSellImages) {
        let imgArray = [];
        if (!buyNSellImages[0]) {
          let fileName = await uploadAndCreateImage(
            buyNSellImages,
            "buynsell",
            newBuyNSell._id,
            res
          );
          imgArray.push(fileName);
        } else {
          for (let img of buyNSellImages) {
            let fileName = await uploadAndCreateImage(
              img,
              "buynsell",
              newBuyNSell._id,
              res
            );
            imgArray.push(fileName);
          }
        }
        let updatedBuyNSell = await findAndUpdateBuyNSell(
          { _id: newBuyNSell._id },
          {
            images: imgArray,
          }
        );
        if (!updatedBuyNSell) {
          return sendResponse(res, 400, false, "Unable to save images.");
        }
      }

      return sendResponse(
        res,
        200,
        true,
        "Successfully added new item.",
        newBuyNSell
      );
    }
  }, res);
};

const editBuyNSell = async (req, res) => {
  return asyncErrorHandler(async () => {
    const { id: buynsellId } = req.params;
    const { _id: userId } = req.tokenData;
    const {
      name,
      description,
      location,
      price,
      category,
      phone,
      contactEmail,
    } = req.body;

    const buynsellRecord = await findBuyNSellByIdHelper(buynsellId);
    if (!buynsellRecord) {
      return sendResponse(res, 404, false, "BuyNSell record not found");
    }

    // Check if the BuyNSell record's createdBy is equal to the user's id
    if (buynsellRecord.createdBy.toString() !== userId.toString()) {
      return sendResponse(
        res,
        403,
        false,
        "You are not authorized to edit this BuyNSell record."
      );
    }

    if (req.files) {
      const { images } = req.files;
      await editImage(buynsellId, images, res);
    }

    const findInfo = { _id: buynsellId, status: true };
    const setInfo = {
      name,
      description,
      location,
      price,
      category,
      phone,
      contactEmail,
      updatedBy: userId,
    };

    const updatedBuyNSell = await findAndUpdateBuyNSell(findInfo, setInfo);
    if (!updatedBuyNSell) {
      return sendResponse(res, 400, false, "Unable to update BuyNSell info.");
    } else {
      return sendResponse(
        res,
        200,
        true,
        "Successfully updated BuyNSell info.",
        updatedBuyNSell
      );
    }
  }, res);
};

const editImage = async (buynsellId, images, res) => {
  const buynsellRecord = await findBuyNSellByIdHelper(buynsellId);
  if (!buynsellRecord) {
    return sendResponse(res, 400, false, "BuyNSell record not found.");
  }

  const imagePaths = [];
  if (!images[0]) {
    let fileName = await uploadAndCreateImage(
      images,
      "buynsell",
      buynsellId,
      res
    );
    imagePaths.push(fileName);
  } else {
    for (let file of images) {
      let fileName = await uploadAndCreateImage(
        file,
        "buynsell",
        buynsellId,
        res
      );
      imagePaths.push(fileName);
    }
  }

  buynsellRecord.images = [...buynsellRecord.images, ...imagePaths];
  await buynsellRecord.save();
};

const getBuyNSellRecords = async (req, res) => {
  return asyncErrorHandler(async () => {
    const { city: location } = req.tokenData;

    const items = await findBuyNSellByLocation(location);
    if (!items || items.length === 0) {
      return sendResponse(res, 404, false, "No items found in this location.");
    }

    return sendResponse(res, 200, true, "Successfully fetched items.", items);
  }, res);
};

const getBuyNSellById = async (req, res) => {
  return asyncErrorHandler(async () => {
    const { id } = req.params;

    const item = await findBuyNSellById(id);
    if (!item) {
      return sendResponse(res, 404, false, "Item not found.");
    }

    return sendResponse(res, 200, true, "Successfully fetched item.", item);
  }, res);
};

const deleteBuyNSellImages = async (req, res) => {
  return asyncErrorHandler(async () => {
    const { buynsellId, imageUrls } = req.body;
    const { _id: userId } = req.tokenData;
    const buynsellRecord = await findBuyNSellByIdHelper(buynsellId);
    if (!buynsellRecord) {
      return sendResponse(res, 404, false, "BuyNSell record not found");
    }

    // Check if the BuyNSell record's createdBy is equal to the user's id
    if (buynsellRecord.createdBy.toString() !== userId.toString()) {
      return sendResponse(
        res,
        403,
        false,
        "You are not authorized to delete images of this BuyNSell record."
      );
    }

    const deleteImagePromises = imageUrls.map(async (imageUrl) => {
      const imageIdentifier = extractImageIdentifier(imageUrl);
      const deletedImage = await deleteImageFromStorage(
        imageIdentifier,
        buynsellId,
        "buynsell"
      );
      buynsellRecord.images = buynsellRecord.images.filter(
        (img) => img !== imageIdentifier
      );
    });
    await Promise.all(deleteImagePromises);
    let updatedBuyNSell = await findAndUpdateBuyNSell(
      { _id: buynsellId },
      buynsellRecord
    );
    if (!updatedBuyNSell) {
      return sendResponse(res, 404, false, "Unable to save changes.");
    }
    return sendResponse(res, 200, true, "Deleted successfully.");
  }, res);
};

const addBuyNSellReview = async (req, res) => {
  return asyncErrorHandler(async () => {
    const { _id: userId } = req.tokenData;
    let { buynsellId, review } = req.body;
    if (!isNotEmpty(review)) {
      return sendResponse(res, 400, false, "Please write a review.");
    }
    let buynsellRecord = await findBuyNSellByIdHelper(buynsellId);
    if (!buynsellRecord) {
      return sendResponse(res, 404, false, "BuyNSell record not found.");
    }
    let newReview = { user: userId, reviewText: review };
    buynsellRecord.reviews.unshift(newReview);
    await buynsellRecord.save();
    return sendResponse(res, 200, true, "Successfully added your review.");
  }, res);
};

module.exports = {
  addBuyNSell,
  editBuyNSell,
  getBuyNSellRecords,
  getBuyNSellById,
  deleteBuyNSellImages,
  addBuyNSellReview,
};
