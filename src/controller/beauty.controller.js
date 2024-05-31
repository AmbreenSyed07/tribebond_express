/** @format */

const { asyncErrorHandler } = require("../helper/async-error.helper");
const { sendResponse } = require("../helper/local.helpers");
const { isNotEmpty } = require("../helper/validate.helpers");
const {
  createBeautyRecord,
  findAndUpdateBeautyRecord,
  findBeautyRecordByIdHelper,
  findBeautyRecordById,
  findBeautyRecordsByCity,
  searchBeautyRecords,
} = require("../service/beauty.service");
const {
  extractImageIdentifier,
  deleteImageFromStorage,
  uploadAndCreateImage,
} = require("../helper/upload.helpers");

const addBeautyRecord = async (req, res) => {
  return asyncErrorHandler(async () => {
    const { _id: userId } = req.tokenData;
    const {
      name,
      description,
      address,
      city,
      phone,
      email,
      services,
      website,
    } = req.body;
    let beauty_images = req && req.files && req.files.images;

    if (!isNotEmpty(name)) {
      return sendResponse(res, 400, false, "Please enter the name.");
    } else if (!isNotEmpty(address)) {
      return sendResponse(res, 400, false, "Please enter an address.");
    } else if (!isNotEmpty(city)) {
      return sendResponse(res, 400, false, "Please enter the city.");
    } else if (!isNotEmpty(phone)) {
      return sendResponse(res, 400, false, "Please enter a contact number.");
    } else if (!isNotEmpty(email)) {
      return sendResponse(res, 400, false, "Please enter your email.");
    }
    const info = {
      name,
      description,
      address,
      city,
      phone,
      email,
      services,
      website,
      createdBy: userId,
    };

    const newBeautyRecord = await createBeautyRecord(info);
    if (!newBeautyRecord) {
      return sendResponse(res, 400, false, "Unable to add new beauty record.");
    } else {
      if (beauty_images) {
        let imgArray = [];
        if (!beauty_images[0]) {
          let fileName = await uploadAndCreateImage(
            beauty_images,
            "beauty",
            newBeautyRecord._id,
            res
          );
          imgArray.push(fileName);
        } else {
          for (let img of beauty_images) {
            let fileName = await uploadAndCreateImage(
              img,
              "beauty",
              newBeautyRecord._id,
              res
            );
            imgArray.push(fileName);
          }
        }
        let updatedBeautyRecord = await findAndUpdateBeautyRecord(
          { _id: newBeautyRecord._id },
          {
            images: imgArray,
          }
        );
        if (!updatedBeautyRecord) {
          return sendResponse(res, 400, false, "Unable to save images.");
        }
      }

      return sendResponse(
        res,
        200,
        true,
        "Successfully added new beauty record.",
        newBeautyRecord
      );
    }
  }, res);
};

const editBeautyRecord = async (req, res) => {
  return asyncErrorHandler(async () => {
    const { id: beautyRecordId } = req.params;
    const { _id: userId } = req.tokenData;
    const {
      name,
      description,
      address,
      city,
      phone,
      email,
      services,
      website,
    } = req.body;

    const beautyRecord = await findBeautyRecordByIdHelper(beautyRecordId);
    if (!beautyRecord) {
      return sendResponse(res, 404, false, "Beauty record not found");
    }

    // Check if the Beauty record's createdBy is equal to the user's id
    if (beautyRecord.createdBy.toString() !== userId.toString()) {
      return sendResponse(
        res,
        403,
        false,
        "You are not authorized to edit this Beauty record."
      );
    }

    if (req.files) {
      const { images } = req.files;
      await editImage(beautyRecordId, images, res);
    }

    const findInfo = { _id: beautyRecordId, status: true };
    const setInfo = {
      name,
      description,
      address,
      city,
      phone,
      email,
      services,
      website,
      updatedBy: userId,
    };

    const updatedBeautyRecord = await findAndUpdateBeautyRecord(
      findInfo,
      setInfo
    );
    if (!updatedBeautyRecord) {
      return sendResponse(
        res,
        400,
        false,
        "Unable to update beauty record info."
      );
    } else {
      return sendResponse(
        res,
        200,
        true,
        "Successfully updated beauty record info.",
        updatedBeautyRecord
      );
    }
  }, res);
};

const editImage = async (beautyRecordId, images, res) => {
  const beautyRecord = await findBeautyRecordByIdHelper(beautyRecordId);
  if (!beautyRecord) {
    return sendResponse(res, 400, false, "Beauty record not found.");
  }

  const imagePaths = [];
  if (!images[0]) {
    let fileName = await uploadAndCreateImage(
      images,
      "beauty",
      beautyRecordId,
      res
    );
    imagePaths.push(fileName);
  } else {
    for (let file of images) {
      let fileName = await uploadAndCreateImage(
        file,
        "beauty",
        beautyRecordId,
        res
      );
      imagePaths.push(fileName);
    }
  }

  beautyRecord.images = [...beautyRecord.images, ...imagePaths];
  await beautyRecord.save();
};

const getBeautyRecords = async (req, res) => {
  return asyncErrorHandler(async () => {
    const { city } = req.tokenData;
    const beautyRecords = await findBeautyRecordsByCity(city);
    if (!beautyRecords) {
      return sendResponse(res, 400, false, "No beauty records found.");
    }

    return sendResponse(
      res,
      200,
      true,
      "Successfully fetched beauty records.",
      beautyRecords
    );
  }, res);
};

const getBeautyRecordById = async (req, res) => {
  return asyncErrorHandler(async () => {
    let { id } = req.params;
    let beautyRecord = await findBeautyRecordById(id);
    if (!beautyRecord) {
      return sendResponse(res, 400, false, "Beauty record not found.");
    }
    return sendResponse(
      res,
      200,
      true,
      "Successfully fetched beauty record.",
      beautyRecord
    );
  }, res);
};

const deleteBeautyRecordImages = async (req, res) => {
  return asyncErrorHandler(async () => {
    const { beautyRecordId, imageUrls } = req.body;
    const { _id: userId } = req.tokenData;
    const beautyRecord = await findBeautyRecordByIdHelper(beautyRecordId);
    if (!beautyRecord) {
      return sendResponse(res, 404, false, "Beauty record not found");
    }

    // Check if the Beauty record's createdBy is equal to the user's id
    if (beautyRecord.createdBy.toString() !== userId.toString()) {
      return sendResponse(
        res,
        403,
        false,
        "You are not authorized to delete images of this Beauty record."
      );
    }

    const deleteImagePromises = imageUrls.map(async (imageUrl) => {
      const imageIdentifier = extractImageIdentifier(imageUrl);
      const deletedImage = await deleteImageFromStorage(
        imageIdentifier,
        beautyRecordId,
        "beauty"
      );
      beautyRecord.images = beautyRecord.images.filter(
        (img) => img !== imageIdentifier
      );
    });
    await Promise.all(deleteImagePromises);
    let updatedBeautyRecord = await findAndUpdateBeautyRecord(
      { _id: beautyRecordId },
      beautyRecord
    );
    if (!updatedBeautyRecord) {
      return sendResponse(res, 404, false, "Unable to save changes.");
    }
    return sendResponse(res, 200, true, "Deleted successfully.");
  }, res);
};

const addBeautyRecordReview = async (req, res) => {
  return asyncErrorHandler(async () => {
    const { _id: userId } = req.tokenData;
    let { beautyRecordId, review } = req.body;
    if (!isNotEmpty(review)) {
      return sendResponse(res, 400, false, "Please write a review.");
    }
    let beautyRecord = await findBeautyRecordByIdHelper(beautyRecordId);
    if (!beautyRecord) {
      return sendResponse(res, 404, false, "Beauty record not found.");
    }
    let newReview = { user: userId, reviewText: review };
    beautyRecord.reviews.unshift(newReview);
    await beautyRecord.save();
    return sendResponse(res, 200, true, "Successfully added your review.");
  }, res);
};

const searchBeautyRecord = async (req, res) => {
  return asyncErrorHandler(async () => {
    const { query } = req.body;

    if (!query) {
      return sendResponse(res, 400, false, "Query parameter is required.");
    }

    const beautyRecords = await searchBeautyRecords(query);
    if (!beautyRecords || beautyRecords.length === 0) {
      return sendResponse(res, 404, false, "No beauty records found.");
    }

    return sendResponse(
      res,
      200,
      true,
      "Successfully fetched beauty records.",
      beautyRecords
    );
  }, res);
};

module.exports = {
  addBeautyRecord,
  editBeautyRecord,
  getBeautyRecords,
  getBeautyRecordById,
  deleteBeautyRecordImages,
  addBeautyRecordReview,
  searchBeautyRecord,
};
