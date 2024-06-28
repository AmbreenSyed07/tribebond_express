/** @format */

const { asyncErrorHandler } = require("../helper/async-error.helper");
const { sendResponse } = require("../helper/local.helpers");
const {
  isNotEmpty,
  isPhoneNo,
  isEmail,
  isWebsite,
} = require("../helper/validate.helpers");
const {
  createLegal,
  findAndUpdateLegal,
  findLegalByIdHelper,
  findLegalById,
  findLegalsByCity,
  searchLegals,
} = require("../service/legal.service");
const {
  extractImageIdentifier,
  deleteImageFromStorage,
  uploadAndCreateImage,
} = require("../helper/upload.helpers");

const addLegal = async (req, res) => {
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
    let legal_images = req && req.files && req.files.images;

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
    } else if (!isNotEmpty(email) || !isEmail(email)) {
      return sendResponse(res, 400, false, "Please enter your valid email.");
    } else if (!isNotEmpty(services)) {
      return sendResponse(
        res,
        400,
        false,
        "Please enter your provided services."
      );
    } else if (!isWebsite(website)) {
      return sendResponse(res, 400, false, "Please enter a valid website url.");
    } else if (!legal_images || legal_images.length <= 0) {
      return sendResponse(res, 400, false, "Please select images.");
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

    const newLegal = await createLegal(info);
    if (!newLegal) {
      return sendResponse(
        res,
        400,
        false,
        "Unable to add new legal service/document."
      );
    } else {
      if (legal_images) {
        let imgArray = [];
        if (!legal_images[0]) {
          let fileName = await uploadAndCreateImage(
            legal_images,
            "legal",
            newLegal._id,
            res
          );
          imgArray.push(fileName);
        } else {
          for (let img of legal_images) {
            let fileName = await uploadAndCreateImage(
              img,
              "legal",
              newLegal._id,
              res
            );
            imgArray.push(fileName);
          }
        }
        let updatedLegal = await findAndUpdateLegal(
          { _id: newLegal._id },
          { images: imgArray }
        );
        if (!updatedLegal) {
          return sendResponse(res, 400, false, "Unable to save images.");
        }
      }
      return sendResponse(
        res,
        200,
        true,
        "Successfully added new legal service/document.",
        newLegal
      );
    }
  }, res);
};

const editLegal = async (req, res) => {
  return asyncErrorHandler(async () => {
    const { id: legalId } = req.params;
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

    const checkLegal = await findLegalByIdHelper(legalId);
    if (!checkLegal) {
      return sendResponse(res, 404, false, "Legal service/document not found.");
    }

    // Check if the legal's createdBy is equal to the user's id
    if (checkLegal.createdBy.toString() !== userId.toString()) {
      return sendResponse(
        res,
        403,
        false,
        "You are not authorized to edit this legal service/document."
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
    } else if (!isNotEmpty(email) || !isEmail(email)) {
      return sendResponse(res, 400, false, "Please enter your valid email.");
    } else if (!isNotEmpty(services)) {
      return sendResponse(
        res,
        400,
        false,
        "Please enter your provided services."
      );
    } else if (!isWebsite(website)) {
      return sendResponse(res, 400, false, "Please enter a valid website url.");
    }

    if (req.files) {
      const { images } = req.files;
      await editImage(legalId, images, res);
    }

    const findInfo = { _id: legalId, status: true };
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

    const legal = await findAndUpdateLegal(findInfo, setInfo);
    if (!legal) {
      return sendResponse(
        res,
        400,
        false,
        "Unable to update legal service/document info."
      );
    } else {
      return sendResponse(
        res,
        200,
        true,
        "Successfully updated legal service/document info.",
        legal
      );
    }
  }, res);
};

const editImage = async (legalId, images, res) => {
  const legal = await findLegalByIdHelper(legalId);
  if (!legal) {
    return sendResponse(res, 400, false, "Legal service/document not found.");
  }

  const imagePaths = [];
  if (!images[0]) {
    let fileName = await uploadAndCreateImage(images, "legal", legalId, res);
    imagePaths.push(fileName);
  } else {
    for (let file of images) {
      let fileName = await uploadAndCreateImage(file, "legal", legalId, res);
      imagePaths.push(fileName);
    }
  }

  legal.images = [...legal.images, ...imagePaths];
  await legal.save();
};

const getLegals = async (req, res) => {
  return asyncErrorHandler(async () => {
    const { city } = req.tokenData;

    const { query } = req.query;

    let legals;
    if (query) {
      legals = await searchLegals(query);
    } else {
      legals = await findLegalsByCity(city);
    }

    if (!legals) {
      return sendResponse(
        res,
        400,
        false,
        "No legal services/documents found."
      );
    }

    return sendResponse(
      res,
      200,
      true,
      "Successfully fetched legal services/documents.",
      legals
    );
  }, res);
};

const getLegalById = async (req, res) => {
  return asyncErrorHandler(async () => {
    const { id } = req.params;
    const legal = await findLegalById(id);
    if (!legal) {
      return sendResponse(res, 400, false, "Legal service/document not found.");
    }
    return sendResponse(
      res,
      200,
      true,
      "Successfully fetched legal service/document.",
      legal
    );
  }, res);
};

const deleteLegalImages = async (req, res) => {
  return asyncErrorHandler(async () => {
    const { legalId, imageUrls } = req.body;
    const { _id: userId } = req.tokenData;

    if (!legalId) {
      return sendResponse(res, 400, false, "Please select a record id.");
    }

    const legal = await findLegalByIdHelper(legalId);
    if (!legal) {
      return sendResponse(res, 404, false, "Legal service/document not found");
    }
    if (legal.createdBy.toString() !== userId.toString()) {
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
      await deleteImageFromStorage(imageIdentifier, legalId, "legal");
      legal.images = legal.images.filter((img) => img !== imageIdentifier);
    });
    await Promise.all(deleteImagePromises);
    let updatedLegal = await findAndUpdateLegal({ _id: legalId }, legal);
    if (!updatedLegal) {
      return sendResponse(res, 404, false, "Unable to save changes.");
    }
    return sendResponse(res, 200, true, "Deleted successfully.");
  }, res);
};

const addLegalReview = async (req, res) => {
  return asyncErrorHandler(async () => {
    const { _id: userId } = req.tokenData;
    const { legalId, review } = req.body;
    if (!legalId) {
      return sendResponse(res, 400, false, "Please select a record id.");
    }

    if (!isNotEmpty(review)) {
      return sendResponse(res, 400, false, "Please write a review.");
    }
    const legal = await findLegalByIdHelper(legalId);
    if (!legal) {
      return sendResponse(res, 404, false, "Legal service/document not found.");
    }
    const newReview = { user: userId, reviewText: review };
    legal.reviews.unshift(newReview);
    await legal.save();
    return sendResponse(res, 200, true, "Successfully added your review.");
  }, res);
};

const searchLegal = async (req, res) => {
  return asyncErrorHandler(async () => {
    const { query } = req.body;

    if (!query) {
      return sendResponse(res, 400, false, "Query parameter is required.");
    }

    const legals = await searchLegals(query);
    if (!legals || legals.length === 0) {
      return sendResponse(res, 404, false, "No legals found.");
    }

    return sendResponse(res, 200, true, "Successfully fetched legals.", legals);
  }, res);
};

const deleteLegal = async (req, res) => {
  return asyncErrorHandler(async () => {
    const { id } = req.params;
    const { _id: userId } = req.tokenData;

    const legal = await findLegalByIdHelper(id);
    if (!legal) {
      return sendResponse(res, 404, false, "Record not found");
    }
    if (legal.createdBy.toString() !== userId.toString()) {
      return sendResponse(
        res,
        403,
        false,
        "You are not authorized to delete this record."
      );
    }

    const deletedLegal = await findAndUpdateLegal(
      { _id: id },
      {
        status: false,
        updatedBy: userId,
      }
    );
    if (!deletedLegal) {
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
  addLegal,
  editLegal,
  getLegals,
  getLegalById,
  deleteLegalImages,
  addLegalReview,
  searchLegal,
  deleteLegal,
};
