/** @format */

const { asyncErrorHandler } = require("../helper/async-error.helper");
const { sendResponse } = require("../helper/local.helpers");
const { isNotEmpty } = require("../helper/validate.helpers");
const {
  createRealEstateRecord,
  findAndUpdateRealEstateRecord,
  findRealEstateRecordByIdHelper,
  findRealEstateRecordById,
  findRealEstateRecordsByCity,
  searchRealEstates,
} = require("../service/realEstate.service");
const {
  extractImageIdentifier,
  deleteImageFromStorage,
  uploadAndCreateImage,
} = require("../helper/upload.helpers");

const addRealEstateRecord = async (req, res) => {
  return asyncErrorHandler(async () => {
    const { _id: userId } = req.tokenData;
    const { name, description, address, city, phone, email, price } = req.body;
    let realEstate_images = req && req.files && req.files.images;

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
      price,
      createdBy: userId,
    };

    const newRealEstateRecord = await createRealEstateRecord(info);
    if (!newRealEstateRecord) {
      return sendResponse(
        res,
        400,
        false,
        "Unable to add new real estate record."
      );
    } else {
      if (realEstate_images) {
        let imgArray = [];
        if (!realEstate_images[0]) {
          let fileName = await uploadAndCreateImage(
            realEstate_images,
            "realEstate",
            newRealEstateRecord._id,
            res
          );
          imgArray.push(fileName);
        } else {
          for (let img of realEstate_images) {
            let fileName = await uploadAndCreateImage(
              img,
              "realEstate",
              newRealEstateRecord._id,
              res
            );
            imgArray.push(fileName);
          }
        }
        let updatedRealEstateRecord = await findAndUpdateRealEstateRecord(
          { _id: newRealEstateRecord._id },
          {
            images: imgArray,
          }
        );
        if (!updatedRealEstateRecord) {
          return sendResponse(res, 400, false, "Unable to save images.");
        }
      }

      return sendResponse(
        res,
        200,
        true,
        "Successfully added new real estate record.",
        newRealEstateRecord
      );
    }
  }, res);
};

const editRealEstateRecord = async (req, res) => {
  return asyncErrorHandler(async () => {
    const { id: realEstateRecordId } = req.params;
    const { _id: userId } = req.tokenData;
    const { name, description, address, city, phone, email, price } = req.body;

    const realEstateRecord = await findRealEstateRecordByIdHelper(
      realEstateRecordId
    );
    if (!realEstateRecord) {
      return sendResponse(res, 404, false, "Real estate record not found");
    }
    if (realEstateRecord.createdBy.toString() !== userId.toString()) {
      return sendResponse(
        res,
        403,
        false,
        "You are not authorized to edit this Real estate record."
      );
    }

    if (req.files) {
      const { images } = req.files;
      await editImage(realEstateRecordId, images, res);
    }

    const findInfo = { _id: realEstateRecordId, status: true };
    const setInfo = {
      name,
      description,
      address,
      city,
      phone,
      email,
      price,
      updatedBy: userId,
    };

    const updatedRealEstateRecord = await findAndUpdateRealEstateRecord(
      findInfo,
      setInfo
    );
    if (!updatedRealEstateRecord) {
      return sendResponse(
        res,
        400,
        false,
        "Unable to update real estate record info."
      );
    } else {
      return sendResponse(
        res,
        200,
        true,
        "Successfully updated real estate record info.",
        updatedRealEstateRecord
      );
    }
  }, res);
};

const editImage = async (realEstateRecordId, images, res) => {
  const realEstateRecord = await findRealEstateRecordByIdHelper(
    realEstateRecordId
  );
  if (!realEstateRecord) {
    return sendResponse(res, 400, false, "Real estate record not found.");
  }

  const imagePaths = [];
  if (!images[0]) {
    let fileName = await uploadAndCreateImage(
      images,
      "realEstate",
      realEstateRecordId,
      res
    );
    imagePaths.push(fileName);
  } else {
    for (let file of images) {
      let fileName = await uploadAndCreateImage(
        file,
        "realEstate",
        realEstateRecordId,
        res
      );
      imagePaths.push(fileName);
    }
  }

  realEstateRecord.images = [...realEstateRecord.images, ...imagePaths];
  await realEstateRecord.save();
};

const getRealEstateRecords = async (req, res) => {
  return asyncErrorHandler(async () => {
    const { city } = req.tokenData;

    const { query } = req.query;

    let realEstateRecords;
    if (query) {
      realEstateRecords = await searchRealEstates(query);
    } else {
      realEstateRecords = await findRealEstateRecordsByCity(city);
    }

    if (!realEstateRecords) {
      return sendResponse(res, 400, false, "No real estate records found.");
    }

    return sendResponse(
      res,
      200,
      true,
      "Successfully fetched real estate records.",
      realEstateRecords
    );
  }, res);
};

const getRealEstateRecordById = async (req, res) => {
  return asyncErrorHandler(async () => {
    let { id } = req.params;
    let realEstateRecord = await findRealEstateRecordById(id);
    if (!realEstateRecord) {
      return sendResponse(res, 400, false, "Real estate record not found.");
    }
    return sendResponse(
      res,
      200,
      true,
      "Successfully fetched real estate record.",
      realEstateRecord
    );
  }, res);
};

const deleteRealEstateRecordImages = async (req, res) => {
  return asyncErrorHandler(async () => {
    const { realEstateRecordId, imageUrls } = req.body;
    const { _id: userId } = req.tokenData;
    const realEstateRecord = await findRealEstateRecordByIdHelper(
      realEstateRecordId
    );
    if (!realEstateRecord) {
      return sendResponse(res, 404, false, "Real estate record not found");
    }

    // Check if the Real estate record's createdBy is equal to the user's id
    if (realEstateRecord.createdBy.toString() !== userId.toString()) {
      return sendResponse(
        res,
        403,
        false,
        "You are not authorized to delete images of this Real estate record."
      );
    }

    const deleteImagePromises = imageUrls.map(async (imageUrl) => {
      const imageIdentifier = extractImageIdentifier(imageUrl);
      const deletedImage = await deleteImageFromStorage(
        imageIdentifier,
        realEstateRecordId,
        "realEstate"
      );
      realEstateRecord.images = realEstateRecord.images.filter(
        (img) => img !== imageIdentifier
      );
    });
    await Promise.all(deleteImagePromises);
    let updatedRealEstateRecord = await findAndUpdateRealEstateRecord(
      { _id: realEstateRecordId },
      realEstateRecord
    );
    if (!updatedRealEstateRecord) {
      return sendResponse(res, 404, false, "Unable to save changes.");
    }
    return sendResponse(res, 200, true, "Deleted successfully.");
  }, res);
};

const addRealEstateRecordReview = async (req, res) => {
  return asyncErrorHandler(async () => {
    const { _id: userId } = req.tokenData;
    let { realEstateRecordId, review } = req.body;
    if (!isNotEmpty(review)) {
      return sendResponse(res, 400, false, "Please write a review.");
    }
    let realEstateRecord = await findRealEstateRecordByIdHelper(
      realEstateRecordId
    );
    if (!realEstateRecord) {
      return sendResponse(res, 404, false, "Real estate record not found.");
    }
    let newReview = { user: userId, reviewText: review };
    realEstateRecord.reviews.unshift(newReview);
    await realEstateRecord.save();
    return sendResponse(res, 200, true, "Successfully added your review.");
  }, res);
};

const searchRealEstate = async (req, res) => {
  return asyncErrorHandler(async () => {
    const { query } = req.body;

    if (!query) {
      return sendResponse(res, 400, false, "Query parameter is required.");
    }

    const realEstates = await searchRealEstates(query);
    if (!realEstates || realEstates.length === 0) {
      return sendResponse(res, 404, false, "No real estates found.");
    }

    return sendResponse(
      res,
      200,
      true,
      "Successfully fetched real estates.",
      realEstates
    );
  }, res);
};

module.exports = {
  addRealEstateRecord,
  editRealEstateRecord,
  getRealEstateRecords,
  getRealEstateRecordById,
  deleteRealEstateRecordImages,
  addRealEstateRecordReview,
  searchRealEstate,
};
