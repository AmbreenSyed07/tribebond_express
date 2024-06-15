/** @format */

const { asyncErrorHandler } = require("../helper/async-error.helper");
const { sendResponse } = require("../helper/local.helpers");
const { isNotEmpty, isPhoneNo } = require("../helper/validate.helpers");
const {
  createMosqueRecord,
  findAndUpdateMosqueRecord,
  findMosqueRecordByIdHelper,
  findMosqueRecordById,
  findMosqueRecordsByCity,
  searchMosqueRecords,
} = require("../service/mosque.service");
const {
  extractImageIdentifier,
  deleteImageFromStorage,
  uploadAndCreateImage,
} = require("../helper/upload.helpers");

const addMosqueRecord = async (req, res) => {
  return asyncErrorHandler(async () => {
    const { _id: userId } = req.tokenData;
    const { name, description, address, city, phone, website, khutbah } =
      req.body;
    let mosque_images = req && req.files && req.files.images;

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
    } else if (!isNotEmpty(website)) {
      return sendResponse(res, 400, false, "Please enter a valid website.");
    } else if (khutbah) {
      if (typeof khutbah === "string") {
        try {
          let khutbahArray = JSON.parse(khutbah);
          if (!Array.isArray(khutbahArray) || khutbahArray.length <= 0) {
            return sendResponse(
              res,
              400,
              false,
              "Please enter khutbah timings."
            );
          }
        } catch (error) {
          return sendResponse(res, 400, false, "Invalid khutbah format.");
        }
      } else if (Array.isArray(khutbah) && khutbah.length <= 0) {
        return sendResponse(res, 400, false, "Please enter khutbah timings.");
      } else {
        return sendResponse(res, 400, false, "Please enter khutbah timings.");
      }
    } else {
      return sendResponse(res, 400, false, "Please enter khutbah timings.");
    }
    if (!mosque_images || mosque_images.length === 0) {
      return sendResponse(res, 400, false, "Please select images.");
    }

    const khutbahArray =
      typeof khutbah == "string" ? JSON.parse(khutbah) : khutbah;

    const info = {
      name,
      description,
      address,
      city,
      phone,
      website,
      khutbah: khutbahArray,
      createdBy: userId,
    };

    const newMosqueRecord = await createMosqueRecord(info);
    if (!newMosqueRecord) {
      return sendResponse(res, 400, false, "Unable to add new mosque record.");
    } else {
      if (mosque_images) {
        let imgArray = [];
        if (!mosque_images[0]) {
          let fileName = await uploadAndCreateImage(
            mosque_images,
            "mosque",
            newMosqueRecord._id,
            res
          );
          imgArray.push(fileName);
        } else {
          for (let img of mosque_images) {
            let fileName = await uploadAndCreateImage(
              img,
              "mosque",
              newMosqueRecord._id,
              res
            );
            imgArray.push(fileName);
          }
        }
        let updatedMosqueRecord = await findAndUpdateMosqueRecord(
          { _id: newMosqueRecord._id },
          {
            images: imgArray,
          }
        );
        if (!updatedMosqueRecord) {
          return sendResponse(res, 400, false, "Unable to save images.");
        }
      }

      return sendResponse(
        res,
        200,
        true,
        "Successfully added new mosque record.",
        newMosqueRecord
      );
    }
  }, res);
};

const editMosqueRecord = async (req, res) => {
  return asyncErrorHandler(async () => {
    const { id: mosqueRecordId } = req.params;
    const { _id: userId } = req.tokenData;
    const { name, description, address, city, phone, website, khutbah } =
      req.body;

    const mosqueRecord = await findMosqueRecordByIdHelper(mosqueRecordId);
    if (!mosqueRecord) {
      return sendResponse(res, 404, false, "Mosque record not found");
    }

    if (mosqueRecord.createdBy.toString() !== userId.toString()) {
      return sendResponse(
        res,
        403,
        false,
        "You are not authorized to edit this mosque record."
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
    } else if (!isNotEmpty(website)) {
      return sendResponse(res, 400, false, "Please enter a valid website.");
    } else if (khutbah) {
      if (typeof khutbah === "string") {
        try {
          let khutbahArray = JSON.parse(khutbah);
          if (!Array.isArray(khutbahArray) || khutbahArray.length <= 0) {
            return sendResponse(
              res,
              400,
              false,
              "Please enter khutbah timings."
            );
          }
        } catch (error) {
          return sendResponse(res, 400, false, "Invalid khutbah format.");
        }
      } else if (Array.isArray(khutbah) && khutbah.length <= 0) {
        return sendResponse(res, 400, false, "Please enter khutbah timings.");
      } else {
        return sendResponse(res, 400, false, "Please enter khutbah timings.");
      }
    } else {
      return sendResponse(res, 400, false, "Please enter khutbah timings.");
    }

    if (req.files) {
      const { images } = req.files;
      await editImage(mosqueRecordId, images, res);
    }
    const khutbahArray =
      typeof khutbah == "string" ? JSON.parse(khutbah) : khutbah;

    const findInfo = { _id: mosqueRecordId, status: true };
    const setInfo = {
      name,
      description,
      address,
      city,
      phone,
      website,
      khutbah: khutbahArray,
      updatedBy: userId,
    };

    const updatedMosqueRecord = await findAndUpdateMosqueRecord(
      findInfo,
      setInfo
    );
    if (!updatedMosqueRecord) {
      return sendResponse(
        res,
        400,
        false,
        "Unable to update mosque record info."
      );
    } else {
      return sendResponse(
        res,
        200,
        true,
        "Successfully updated mosque record info.",
        updatedMosqueRecord
      );
    }
  }, res);
};

const editImage = async (mosqueRecordId, images, res) => {
  const mosqueRecord = await findMosqueRecordByIdHelper(mosqueRecordId);
  if (!mosqueRecord) {
    return sendResponse(res, 400, false, "Mosque record not found.");
  }

  const imagePaths = [];
  if (!images[0]) {
    let fileName = await uploadAndCreateImage(
      images,
      "mosque",
      mosqueRecordId,
      res
    );
    imagePaths.push(fileName);
  } else {
    for (let file of images) {
      let fileName = await uploadAndCreateImage(
        file,
        "mosque",
        mosqueRecordId,
        res
      );
      imagePaths.push(fileName);
    }
  }

  mosqueRecord.images = [...mosqueRecord.images, ...imagePaths];
  await mosqueRecord.save();
};

const getMosqueRecords = async (req, res) => {
  return asyncErrorHandler(async () => {
    const { city } = req.tokenData;
    const mosqueRecords = await findMosqueRecordsByCity(city);
    if (!mosqueRecords) {
      return sendResponse(res, 400, false, "No mosque records found.");
    }

    return sendResponse(
      res,
      200,
      true,
      "Successfully fetched mosque records.",
      mosqueRecords
    );
  }, res);
};

const getMosqueRecordById = async (req, res) => {
  return asyncErrorHandler(async () => {
    let { id } = req.params;
    let mosqueRecord = await findMosqueRecordById(id);
    if (!mosqueRecord) {
      return sendResponse(res, 400, false, "Mosque record not found.");
    }
    return sendResponse(
      res,
      200,
      true,
      "Successfully fetched mosque record.",
      mosqueRecord
    );
  }, res);
};

const deleteMosqueRecordImages = async (req, res) => {
  return asyncErrorHandler(async () => {
    const { mosqueRecordId, imageUrls } = req.body;
    const { _id: userId } = req.tokenData;
    const mosqueRecord = await findMosqueRecordByIdHelper(mosqueRecordId);
    if (!mosqueRecord) {
      return sendResponse(res, 404, false, "Mosque record not found");
    }

    if (mosqueRecord.createdBy.toString() !== userId.toString()) {
      return sendResponse(
        res,
        403,
        false,
        "You are not authorized to delete images of this record."
      );
    }

    const deleteImagePromises = imageUrls.map(async (imageUrl) => {
      const imageIdentifier = extractImageIdentifier(imageUrl);
      const deletedImage = await deleteImageFromStorage(
        imageIdentifier,
        mosqueRecordId,
        "mosque"
      );
      mosqueRecord.images = mosqueRecord.images.filter(
        (img) => img !== imageIdentifier
      );
    });
    await Promise.all(deleteImagePromises);
    let updatedMosqueRecord = await findAndUpdateMosqueRecord(
      { _id: mosqueRecordId },
      mosqueRecord
    );
    if (!updatedMosqueRecord) {
      return sendResponse(res, 404, false, "Unable to save changes.");
    }
    return sendResponse(res, 200, true, "Deleted successfully.");
  }, res);
};

const addMosqueRecordReview = async (req, res) => {
  return asyncErrorHandler(async () => {
    const { _id: userId } = req.tokenData;
    let { mosqueRecordId, review } = req.body;
    if (!isNotEmpty(review)) {
      return sendResponse(res, 400, false, "Please write a review.");
    }
    let mosqueRecord = await findMosqueRecordByIdHelper(mosqueRecordId);
    if (!mosqueRecord) {
      return sendResponse(res, 404, false, "Mosque record not found.");
    }
    let newReview = { user: userId, reviewText: review };
    mosqueRecord.reviews.unshift(newReview);
    await mosqueRecord.save();
    return sendResponse(res, 200, true, "Successfully added your review.");
  }, res);
};

const searchMosque = async (req, res) => {
  return asyncErrorHandler(async () => {
    const { query } = req.body;

    if (!query) {
      return sendResponse(res, 400, false, "Query parameter is required.");
    }

    const mosqueRecords = await searchMosqueRecords(query);
    if (!mosqueRecords || mosqueRecords.length === 0) {
      return sendResponse(res, 404, false, "No mosque records found.");
    }

    return sendResponse(
      res,
      200,
      true,
      "Successfully fetched mosque records.",
      mosqueRecords
    );
  }, res);
};

module.exports = {
  addMosqueRecord,
  editMosqueRecord,
  getMosqueRecords,
  getMosqueRecordById,
  deleteMosqueRecordImages,
  addMosqueRecordReview,
  searchMosque,
};
