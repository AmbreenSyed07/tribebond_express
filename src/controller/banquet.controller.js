/** @format */

const { asyncErrorHandler } = require("../helper/async-error.helper");
const { sendResponse } = require("../helper/local.helpers");
const {
  isNotEmpty,
  isWebsite,
  isPhoneNo,
} = require("../helper/validate.helpers");
const {
  createBanquet,
  findAndUpdateBanquet,
  findBanquetByIdHelper,
  findBanquetById,
  findBanquetsByCity,
  searchBanquets,
} = require("../service/banquet.service");
const {
  extractImageIdentifier,
  deleteImageFromStorage,
  uploadAndCreateImage,
} = require("../helper/upload.helpers");

const addBanquet = async (req, res) => {
  return asyncErrorHandler(async () => {
    const { _id: userId } = req.tokenData;
    const { name, description, address, city, phone, website } = req.body;
    let banquet_images = req && req.files && req.files.images;

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
    } else if (!banquet_images || banquet_images.length <= 0) {
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

    const newBanquet = await createBanquet(info);
    if (!newBanquet) {
      return sendResponse(res, 400, false, "Unable to add new banquet.");
    } else {
      if (banquet_images) {
        let imgArray = [];
        if (!banquet_images[0]) {
          let fileName = await uploadAndCreateImage(
            banquet_images,
            "banquet",
            newBanquet._id,
            res
          );
          imgArray.push(fileName);
        } else {
          for (let img of banquet_images) {
            let fileName = await uploadAndCreateImage(
              img,
              "banquet",
              newBanquet._id,
              res
            );
            imgArray.push(fileName);
          }
        }
        let updatedBanquet = await findAndUpdateBanquet(
          { _id: newBanquet._id },
          {
            images: imgArray,
          }
        );
        if (!updatedBanquet) {
          return sendResponse(res, 400, false, "Unable to save images.");
        }
      }

      return sendResponse(
        res,
        200,
        true,
        "Successfully added new banquet.",
        newBanquet
      );
    }
  }, res);
};

const editBanquet = async (req, res) => {
  return asyncErrorHandler(async () => {
    const { id: banquetId } = req.params;
    const { _id: userId } = req.tokenData;
    const { name, description, address, city, phone, website } = req.body;

    const checkBanquet = await findBanquetByIdHelper(banquetId);
    if (!checkBanquet) {
      return sendResponse(res, 404, false, "Record not found.");
    }
    if (checkBanquet.createdBy.toString() !== userId.toString()) {
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
      await editImage(banquetId, images, res);
    }

    const findInfo = { _id: banquetId, status: true };
    const setInfo = {
      name,
      description,
      address,
      city,
      phone,
      website,
      updatedBy: userId,
    };

    const banquet = await findAndUpdateBanquet(findInfo, setInfo);
    if (!banquet) {
      return sendResponse(res, 400, false, "Unable to update banquet info.");
    } else {
      return sendResponse(
        res,
        200,
        true,
        "Successfully updated banquet info.",
        banquet
      );
    }
  }, res);
};

const editImage = async (banquetId, images, res) => {
  const banquet = await findBanquetByIdHelper(banquetId);
  if (!banquet) {
    return sendResponse(res, 400, false, "Record not found.");
  }

  // Assuming images is an array of files
  const imagePaths = [];
  if (!images[0]) {
    let fileName = await uploadAndCreateImage(
      images,
      "banquet",
      banquetId,
      res
    );
    imagePaths.push(fileName);
  } else {
    for (let file of images) {
      let fileName = await uploadAndCreateImage(
        file,
        "banquet",
        banquetId,
        res
      );
      imagePaths.push(fileName);
    }
  }

  banquet.images = [...banquet.images, ...imagePaths];
  await banquet.save();
};

const getBanquets = async (req, res) => {
  return asyncErrorHandler(async () => {
    const { city } = req.tokenData;

    const { query } = req.query;

    let banquets;
    if (query) {
      banquets = await searchBanquets(query);
    } else {
      banquets = await findBanquetsByCity(city);
    }

    if (!banquets) {
      return sendResponse(res, 400, false, "No banquets found.");
    }

    return sendResponse(
      res,
      200,
      true,
      "Successfully fetched banquets.",
      banquets
    );
  }, res);
};

const getBanquetById = async (req, res) => {
  return asyncErrorHandler(async () => {
    let { id } = req.params;
    const banquet = await findBanquetById(id);
    if (!banquet) {
      return sendResponse(res, 400, false, "Record not found.");
    }
    return sendResponse(
      res,
      200,
      true,
      "Successfully fetched banquet.",
      banquet
    );
  }, res);
};

const deleteBanquetImages = async (req, res) => {
  return asyncErrorHandler(async () => {
    const { banquetId, imageUrls } = req.body;
    const { _id: userId } = req.tokenData;

    if (!banquetId) {
      return sendResponse(res, 400, false, "Please select a record id.");
    }

    const banquet = await findBanquetByIdHelper(banquetId);
    if (!banquet) {
      return sendResponse(res, 404, false, "Record not found");
    }

    if (banquet.createdBy.toString() !== userId.toString()) {
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
        banquetId,
        "banquet"
      );
      banquet.images = banquet.images.filter((img) => img !== imageIdentifier);
    });
    await Promise.all(deleteImagePromises);
    let updatedBanquet = await findAndUpdateBanquet(
      { _id: banquetId },
      banquet
    );
    if (!updatedBanquet) {
      return sendResponse(res, 404, false, "Unable to save changes.");
    }
    return sendResponse(res, 200, true, "Deleted successfully.");
  }, res);
};

const addBanquetReview = async (req, res) => {
  return asyncErrorHandler(async () => {
    const { _id: userId } = req.tokenData;
    const { banquetId, review } = req.body;
    if (!banquetId) {
      return sendResponse(res, 400, false, "Please select a record id.");
    }
    if (!isNotEmpty(review)) {
      return sendResponse(res, 400, false, "Please write a review.");
    }
    const banquet = await findBanquetByIdHelper(banquetId);
    if (!banquet) {
      return sendResponse(res, 404, false, "Record not found.");
    }
    const newReview = { user: userId, reviewText: review };
    banquet.reviews.unshift(newReview);
    await banquet.save();
    return sendResponse(res, 200, true, "Successfully added your review.");
  }, res);
};

const searchBanquet = async (req, res) => {
  return asyncErrorHandler(async () => {
    const { query } = req.body;

    if (!query) {
      return sendResponse(res, 400, false, "Query parameter is required.");
    }

    const banquets = await searchBanquets(query);
    if (!banquets || banquets.length === 0) {
      return sendResponse(res, 404, false, "No banquets found.");
    }

    return sendResponse(
      res,
      200,
      true,
      "Successfully fetched banquets.",
      banquets
    );
  }, res);
};

const deleteBanquet = async (req, res) => {
  return asyncErrorHandler(async () => {
    const { id } = req.params;
    const { _id: userId } = req.tokenData;

    const banquet = await findBanquetByIdHelper(id);
    if (!banquet) {
      return sendResponse(res, 404, false, "Record not found");
    }
    if (banquet.createdBy.toString() !== userId.toString()) {
      return sendResponse(
        res,
        403,
        false,
        "You are not authorized to delete this record."
      );
    }

    const deletedBanquet = await findAndUpdateBanquet(
      { _id: id },
      {
        status: false,
        updatedBy: userId,
      }
    );
    if (!deletedBanquet) {
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
  addBanquet,
  editBanquet,
  getBanquets,
  getBanquetById,
  deleteBanquetImages,
  addBanquetReview,
  searchBanquet,
  deleteBanquet,
};
