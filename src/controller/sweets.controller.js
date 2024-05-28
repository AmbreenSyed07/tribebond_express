/** @format */

const { asyncHandler } = require("../helper/async-error.helper");
const { sendResponse } = require("../helper/local.helpers");
const { isNotEmpty } = require("../helper/validate.helpers");
const {
  createSweetShop,
  findAndUpdateSweetShop,
  findSweetShopByIdHelper,
  findSweetShopById,
  findSweetShopsByCity,
} = require("../service/sweets.service");
const {
  extractImageIdentifier,
  deleteImageFromStorage,
  uploadAndCreateImage,
} = require("../helper/upload.helpers");

const addSweetShop = async (req, res) => {
  return asyncHandler(async () => {
    const { _id: userId } = req.tokenData;
    const { name, description, address, city, phone, website } = req.body;
    let shop_images = req && req.files && req.files.images;

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
  return asyncHandler(async () => {
    const { id: shopId } = req.params;
    const { _id: userId } = req.tokenData;
    const { name, description, address, city, phone, website } = req.body;

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
  return asyncHandler(async () => {
    const { city } = req.tokenData;
    const sweetShops = await findSweetShopsByCity(city);
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
  return asyncHandler(async () => {
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
  return asyncHandler(async () => {
    const { shopId, imageUrls } = req.body;
    const sweetShop = await findSweetShopByIdHelper(shopId);
    if (!sweetShop) {
      return sendResponse(res, 404, false, "Sweet shop not found");
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
  return asyncHandler(async () => {
    const { _id: userId } = req.tokenData;
    const { shopId, review } = req.body;
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

module.exports = {
  addSweetShop,
  editSweetShop,
  getSweetsShops,
  getSweetShopById,
  deleteSweetShopImages,
  addSweetShopReview,
};
