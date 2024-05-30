/** @format */

const { asyncErrorHandler } = require("../helper/async-error.helper");
const { sendResponse } = require("../helper/local.helpers");
const { isNotEmpty } = require("../helper/validate.helpers");
const {
  createLegal,
  findAndUpdateLegal,
  findLegalByIdHelper,
  findLegalById,
  findLegalsByCity,
  deleteLegalImages: deleteLegalImagesService,
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
    const legals = await findLegalsByCity(city);
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
    const legal = await findLegalByIdHelper(legalId);
    if (!legal) {
      return sendResponse(res, 404, false, "Legal service/document not found");
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

module.exports = {
  addLegal,
  editLegal,
  getLegals,
  getLegalById,
  deleteLegalImages,
  addLegalReview,
};
