/** @format */

const { asyncErrorHandler } = require("../helper/async-error.helper");
const { sendResponse } = require("../helper/local.helpers");
const {
  isNotEmpty,
  isPhoneNo,
  isWebsite,
} = require("../helper/validate.helpers");
const {
  createSweetShop,
  findAndUpdateSweetShop,
  findSweetShopByIdHelper,
  findSweetShopById,
  findSweetShopsByCity,
  searchSweets,
} = require("../service/sweets.service");
const {
  extractImageIdentifier,
  deleteImageFromStorage,
  uploadAndCreateImage,
} = require("../helper/upload.helpers");

const addSweetShop = async (req, res) => {
  return asyncErrorHandler(async () => {
    const { _id: userId } = req.tokenData;
    const { name, description, address, city, phone, website } = req.body;
    let shop_images = req && req.files && req.files.images;

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
    } else if (!shop_images || shop_images.length <= 0) {
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

    const newSweetShop = await createSweetShop(info);
    if (!newSweetShop) {
      return sendResponse(res, 400, false, "Unable to add new sweet shop.");
    } else {
      if (shop_images) {
        let imgArray = [];
        if (!shop_images[0]) {
          let fileName = await uploadAndCreateImage(
            shop_images,
            "sweets",
            newSweetShop._id,
            res
          );
          imgArray.push(fileName);
        } else {
          for (let img of shop_images) {
            let fileName = await uploadAndCreateImage(
              img,
              "sweets",
              newSweetShop._id,
              res
            );
            imgArray.push(fileName);
          }
        }
        let updatedSweetShop = await findAndUpdateSweetShop(
          { _id: newSweetShop._id },
          {
            images: imgArray,
          }
        );
        if (!updatedSweetShop) {
          return sendResponse(res, 400, false, "Unable to save images.");
        }
      }

      return sendResponse(
        res,
        200,
        true,
        "Successfully added new sweet shop.",
        newSweetShop
      );
    }
  }, res);
};

const editSweetShop = async (req, res) => {
  return asyncErrorHandler(async () => {
    const { id: shopId } = req.params;
    const { _id: userId } = req.tokenData;
    const { name, description, address, city, phone, website } = req.body;

    const sweetRecord = await findSweetShopByIdHelper(shopId);
    if (!sweetRecord) {
      return sendResponse(res, 404, false, "Record not found");
    }

    if (sweetRecord.createdBy.toString() !== userId.toString()) {
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
    } else if (!isWebsite(website)) {
      return sendResponse(res, 400, false, "Please enter a valid website url.");
    }

    if (req.files) {
      const { images } = req.files;
      await editImage(shopId, images, res);
    }

    const findInfo = { _id: shopId, status: true };
    const setInfo = {
      name,
      description,
      address,
      city,
      phone,
      website,
      updatedBy: userId,
    };

    const sweetShop = await findAndUpdateSweetShop(findInfo, setInfo);
    if (!sweetShop) {
      return sendResponse(res, 400, false, "Unable to update sweet shop info.");
    } else {
      return sendResponse(
        res,
        200,
        true,
        "Successfully updated sweet shop info.",
        sweetShop
      );
    }
  }, res);
};

const editImage = async (sweetShopId, images, res) => {
  const sweetShop = await findSweetShopByIdHelper(sweetShopId);
  if (!sweetShop) {
    return sendResponse(res, 400, false, "Sweet shop not found.");
  }

  // Assuming images is an array of files
  const imagePaths = [];
  if (!images[0]) {
    let fileName = await uploadAndCreateImage(
      images,
      "sweets",
      sweetShopId,
      res
    );
    imagePaths.push(fileName);
  } else {
    for (let file of images) {
      let fileName = await uploadAndCreateImage(
        file,
        "sweets",
        sweetShopId,
        res
      );
      imagePaths.push(fileName);
    }
  }

  sweetShop.images = [...sweetShop.images, ...imagePaths];
  await sweetShop.save();
};

const getSweetsShops = async (req, res) => {
  return asyncErrorHandler(async () => {
    const { city } = req.tokenData;
    const { query } = req.query;

    let sweetShops;
    if (query) {
      sweetShops = await searchSweets(query);
    } else {
      sweetShops = await findSweetShopsByCity(city);
    }
    if (!sweetShops) {
      return sendResponse(res, 400, false, "No sweet shops found.");
    }

    return sendResponse(
      res,
      200,
      true,
      "Successfully fetched sweet shops.",
      sweetShops
    );
  }, res);
};

const getSweetShopById = async (req, res) => {
  return asyncErrorHandler(async () => {
    const { id } = req.params;
    const sweetShop = await findSweetShopById(id);
    if (!sweetShop) {
      return sendResponse(res, 400, false, "Sweet shop not found.");
    }
    return sendResponse(
      res,
      200,
      true,
      "Successfully fetched sweet shop.",
      sweetShop
    );
  }, res);
};

const deleteSweetShopImages = async (req, res) => {
  return asyncErrorHandler(async () => {
    const { shopId, imageUrls } = req.body;
    const { _id: userId } = req.tokenData;

    if (!shopId) {
      return sendResponse(res, 400, false, "Please select a record id.");
    }

    const sweetShop = await findSweetShopByIdHelper(shopId);
    if (!sweetShop) {
      return sendResponse(res, 404, false, "Sweet shop not found");
    }
    if (sweetShop.createdBy.toString() !== userId.toString()) {
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
        shopId,
        "sweets"
      );
      sweetShop.images = sweetShop.images.filter(
        (img) => img !== imageIdentifier
      );
    });
    await Promise.all(deleteImagePromises);
    let updatedSweetShop = await findAndUpdateSweetShop(
      { _id: shopId },
      sweetShop
    );
    if (!updatedSweetShop) {
      return sendResponse(res, 404, false, "Unable to save changes.");
    }
    return sendResponse(res, 200, true, "Deleted successfully.");
  }, res);
};

const addSweetShopReview = async (req, res) => {
  return asyncErrorHandler(async () => {
    const { _id: userId } = req.tokenData;
    const { shopId, review } = req.body;
    if (!shopId) {
      return sendResponse(res, 400, false, "Please select a record id.");
    }
    if (!isNotEmpty(review)) {
      return sendResponse(res, 400, false, "Please write a review.");
    }
    const sweetShop = await findSweetShopByIdHelper(shopId);
    if (!sweetShop) {
      return sendResponse(res, 404, false, "Sweet shop not found.");
    }
    const newReview = { user: userId, reviewText: review };
    sweetShop.reviews.unshift(newReview);
    await sweetShop.save();
    return sendResponse(res, 200, true, "Successfully added your review.");
  }, res);
};

const searchSweet = async (req, res) => {
  return asyncErrorHandler(async () => {
    const { query } = req.body;

    if (!query) {
      return sendResponse(res, 400, false, "Query parameter is required.");
    }

    const sweets = await searchSweets(query);
    if (!sweets || sweets.length === 0) {
      return sendResponse(res, 404, false, "No sweets found.");
    }

    return sendResponse(res, 200, true, "Successfully fetched sweets.", sweets);
  }, res);
};

const deleteSweet = async (req, res) => {
  return asyncErrorHandler(async () => {
    const { id } = req.params;
    const { _id: userId } = req.tokenData;

    const sweet = await findSweetShopByIdHelper(id);
    if (!sweet) {
      return sendResponse(res, 404, false, "Record not found");
    }
    if (sweet.createdBy.toString() !== userId.toString()) {
      return sendResponse(
        res,
        403,
        false,
        "You are not authorized to delete this record."
      );
    }

    const deleteSweet = await findAndUpdateSweetShop(
      { _id: id },
      {
        status: false,
        updatedBy: userId,
      }
    );
    if (!deleteSweet) {
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
  addSweetShop,
  editSweetShop,
  getSweetsShops,
  getSweetShopById,
  deleteSweetShopImages,
  addSweetShopReview,
  searchSweet,
  deleteSweet,
};
