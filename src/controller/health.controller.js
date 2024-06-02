/** @format */

const { asyncErrorHandler } = require("../helper/async-error.helper");
const { sendResponse } = require("../helper/local.helpers");
const { isNotEmpty } = require("../helper/validate.helpers");
const {
  createHealthRecord,
  findAndUpdateHealthRecord,
  findHealthRecordByIdHelper,
  findHealthRecordById,
  findHealthRecordsByCity,
  searchHealthRecords,
} = require("../service/health.service");
const {
  extractImageIdentifier,
  deleteImageFromStorage,
  uploadAndCreateImage,
} = require("../helper/upload.helpers");

const addHealthRecord = async (req, res) => {
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
    let health_images = req && req.files && req.files.images;

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

    const newHealthRecord = await createHealthRecord(info);
    if (!newHealthRecord) {
      return sendResponse(res, 400, false, "Unable to add new health record.");
    } else {
      if (health_images) {
        let imgArray = [];
        if (!health_images[0]) {
          let fileName = await uploadAndCreateImage(
            health_images,
            "health",
            newHealthRecord._id,
            res
          );
          imgArray.push(fileName);
        } else {
          for (let img of health_images) {
            let fileName = await uploadAndCreateImage(
              img,
              "health",
              newHealthRecord._id,
              res
            );
            imgArray.push(fileName);
          }
        }
        let updatedHealthRecord = await findAndUpdateHealthRecord(
          { _id: newHealthRecord._id },
          {
            images: imgArray,
          }
        );
        if (!updatedHealthRecord) {
          return sendResponse(res, 400, false, "Unable to save images.");
        }
      }

      return sendResponse(
        res,
        200,
        true,
        "Successfully added new health record.",
        newHealthRecord
      );
    }
  }, res);
};

const editHealthRecord = async (req, res) => {
  return asyncErrorHandler(async () => {
    const { id: healthRecordId } = req.params;
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

    const health = await findHealthRecordByIdHelper(healthRecordId);
    if (!health) {
      return sendResponse(res, 404, false, "Record not found");
    }

    if (health.createdBy.toString() !== userId.toString()) {
      return sendResponse(
        res,
        403,
        false,
        "You are not authorized to edit this record."
      );
    }

    if (req.files) {
      const { images } = req.files;
      await editImage(healthRecordId, images, res);
    }

    const findInfo = { _id: healthRecordId, status: true };
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

    const healthRecord = await findAndUpdateHealthRecord(findInfo, setInfo);
    if (!healthRecord) {
      return sendResponse(
        res,
        400,
        false,
        "Unable to update health record info."
      );
    } else {
      return sendResponse(
        res,
        200,
        true,
        "Successfully updated health record info.",
        healthRecord
      );
    }
  }, res);
};

const editImage = async (healthRecordId, images, res) => {
  const healthRecord = await findHealthRecordByIdHelper(healthRecordId);
  if (!healthRecord) {
    return sendResponse(res, 400, false, "Health record not found.");
  }

  const imagePaths = [];
  if (!images[0]) {
    let fileName = await uploadAndCreateImage(
      images,
      "health",
      healthRecordId,
      res
    );
    imagePaths.push(fileName);
  } else {
    for (let file of images) {
      let fileName = await uploadAndCreateImage(
        file,
        "health",
        healthRecordId,
        res
      );
      imagePaths.push(fileName);
    }
  }

  healthRecord.images = [...healthRecord.images, ...imagePaths];
  await healthRecord.save();
};

const getHealthRecords = async (req, res) => {
  return asyncErrorHandler(async () => {
    const { city } = req.tokenData;

   const { query } = req.query;

   let healthRecords;
   if (query) {
     healthRecords = await searchHealthRecords(query);
   } else {
     healthRecords = await findHealthRecordsByCity(city);
   }

   
    if (!healthRecords) {
      return sendResponse(res, 400, false, "No health records found.");
    }

    return sendResponse(
      res,
      200,
      true,
      "Successfully fetched health records.",
      healthRecords
    );
  }, res);
};

const getHealthRecordById = async (req, res) => {
  return asyncErrorHandler(async () => {
    let { id } = req.params;
    let healthRecord = await findHealthRecordById(id);
    if (!healthRecord) {
      return sendResponse(res, 400, false, "Health record not found.");
    }
    return sendResponse(
      res,
      200,
      true,
      "Successfully fetched health record.",
      healthRecord
    );
  }, res);
};

const deleteHealthRecordImages = async (req, res) => {
  return asyncErrorHandler(async () => {
    const { healthRecordId, imageUrls } = req.body;
    const { _id: userId } = req.tokenData;

    const healthRecord = await findHealthRecordByIdHelper(healthRecordId);
    if (!healthRecord) {
      return sendResponse(res, 404, false, "Health record not found");
    }

    if (healthRecord.createdBy.toString() !== userId.toString()) {
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
        healthRecordId,
        "health"
      );
      healthRecord.images = healthRecord.images.filter(
        (img) => img !== imageIdentifier
      );
    });
    await Promise.all(deleteImagePromises);
    let updatedHealthRecord = await findAndUpdateHealthRecord(
      { _id: healthRecordId },
      healthRecord
    );
    if (!updatedHealthRecord) {
      return sendResponse(res, 404, false, "Unable to save changes.");
    }
    return sendResponse(res, 200, true, "Deleted successfully.");
  }, res);
};

const addHealthRecordReview = async (req, res) => {
  return asyncErrorHandler(async () => {
    const { _id: userId } = req.tokenData;
    let { healthRecordId, review } = req.body;
    if (!isNotEmpty(review)) {
      return sendResponse(res, 400, false, "Please write a review.");
    }
    let healthRecord = await findHealthRecordByIdHelper(healthRecordId);
    if (!healthRecord) {
      return sendResponse(res, 404, false, "Health record not found.");
    }
    let newReview = { user: userId, reviewText: review };
    healthRecord.reviews.unshift(newReview);
    await healthRecord.save();
    return sendResponse(res, 200, true, "Successfully added your review.");
  }, res);
};

const searchHealthRecord = async (req, res) => {
  return asyncErrorHandler(async () => {
    const { query } = req.body;

    if (!query) {
      return sendResponse(res, 400, false, "Query parameter is required.");
    }

    const healthRecords = await searchHealthRecords(query);
    if (!healthRecords || healthRecords.length === 0) {
      return sendResponse(res, 404, false, "No health records found.");
    }

    return sendResponse(
      res,
      200,
      true,
      "Successfully fetched health records.",
      healthRecords
    );
  }, res);
};

module.exports = {
  addHealthRecord,
  editHealthRecord,
  getHealthRecords,
  getHealthRecordById,
  deleteHealthRecordImages,
  addHealthRecordReview,
  searchHealthRecord,
};
