/** @format */

const { asyncErrorHandler } = require("../helper/async-error.helper");
const { sendResponse } = require("../helper/local.helpers");
const { isNotEmpty } = require("../helper/validate.helpers");
const {
  createElectronic,
  findAndUpdateElectronic,
  findElectronicByIdHelper,
  findElectronicById,
  findElectronicsByCity,
  searchElectronics,
} = require("../service/electronics.service");
const {
  extractImageIdentifier,
  deleteImageFromStorage,
  uploadAndCreateImage,
} = require("../helper/upload.helpers");

const addElectronic = async (req, res) => {
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
    let electronic_images = req && req.files && req.files.images;

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

    const newElectronic = await createElectronic(info);
    if (!newElectronic) {
      return sendResponse(
        res,
        400,
        false,
        "Unable to add new electronic item."
      );
    } else {
      if (electronic_images) {
        let imgArray = [];
        if (!electronic_images[0]) {
          let fileName = await uploadAndCreateImage(
            electronic_images,
            "electronics",
            newElectronic._id,
            res
          );
          imgArray.push(fileName);
        } else {
          for (let img of electronic_images) {
            let fileName = await uploadAndCreateImage(
              img,
              "electronics",
              newElectronic._id,
              res
            );
            imgArray.push(fileName);
          }
        }
        let updatedElectronic = await findAndUpdateElectronic(
          { _id: newElectronic._id },
          {
            images: imgArray,
          }
        );
        if (!updatedElectronic) {
          return sendResponse(res, 400, false, "Unable to save images.");
        }
      }

      return sendResponse(
        res,
        200,
        true,
        "Successfully added new electronic item.",
        newElectronic
      );
    }
  }, res);
};

const editElectronic = async (req, res) => {
  return asyncErrorHandler(async () => {
    const { id: electronicId } = req.params;
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

    const electronics = await findElectronicByIdHelper(electronicId);
    if (!electronics) {
      return sendResponse(res, 404, false, "Record not found");
    }

    if (electronics.createdBy.toString() !== userId.toString()) {
      return sendResponse(
        res,
        403,
        false,
        "You are not authorized to edit this record."
      );
    }

    if (req.files) {
      const { images } = req.files;
      await editImage(electronicId, images, res);
    }

    const findInfo = { _id: electronicId, status: true };
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

    const electronic = await findAndUpdateElectronic(findInfo, setInfo);
    if (!electronic) {
      return sendResponse(res, 400, false, "Unable to update electronic info.");
    } else {
      return sendResponse(
        res,
        200,
        true,
        "Successfully updated electronic info.",
        electronic
      );
    }
  }, res);
};

const editImage = async (electronicId, images, res) => {
  const electronic = await findElectronicByIdHelper(electronicId);
  if (!electronic) {
    return sendResponse(res, 400, false, "Electronic item not found.");
  }

  // Assuming images is an array of files
  const imagePaths = [];
  if (!images[0]) {
    let fileName = await uploadAndCreateImage(
      images,
      "electronics",
      electronicId,
      res
    );
    imagePaths.push(fileName);
  } else {
    for (let file of images) {
      let fileName = await uploadAndCreateImage(
        file,
        "electronics",
        electronicId,
        res
      );
      imagePaths.push(fileName);
    }
  }

  electronic.images = [...electronic.images, ...imagePaths];
  await electronic.save();
};

const getElectronics = async (req, res) => {
  return asyncErrorHandler(async () => {
    const { city } = req.tokenData;

    const { query } = req.query;

    let electronics;
    if (query) {
      electronics = await searchElectronics(query);
    } else {
      electronics = await findElectronicsByCity(city);
    }

    if (!electronics) {
      return sendResponse(res, 400, false, "No electronics found.");
    }

    return sendResponse(
      res,
      200,
      true,
      "Successfully fetched electronics.",
      electronics
    );
  }, res);
};

const getElectronicById = async (req, res) => {
  return asyncErrorHandler(async () => {
    let { id } = req.params;
    const electronic = await findElectronicById(id);
    if (!electronic) {
      return sendResponse(res, 400, false, "Electronic item not found.");
    }
    return sendResponse(
      res,
      200,
      true,
      "Successfully fetched electronic.",
      electronic
    );
  }, res);
};

const deleteElectronicImages = async (req, res) => {
  return asyncErrorHandler(async () => {
    const { electronicId, imageUrls } = req.body;
    const { _id: userId } = req.tokenData;

    const electronic = await findElectronicByIdHelper(electronicId);
    if (!electronic) {
      return sendResponse(res, 404, false, "Electronic item not found");
    }
    if (electronic.createdBy.toString() !== userId.toString()) {
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
        electronicId,
        "electronics"
      );
      electronic.images = electronic.images.filter(
        (img) => img !== imageIdentifier
      );
    });
    await Promise.all(deleteImagePromises);
    let updatedElectronic = await findAndUpdateElectronic(
      { _id: electronicId },
      electronic
    );
    if (!updatedElectronic) {
      return sendResponse(res, 404, false, "Unable to save changes.");
    }
    return sendResponse(res, 200, true, "Deleted successfully.");
  }, res);
};

const addElectronicReview = async (req, res) => {
  return asyncErrorHandler(async () => {
    const { _id: userId } = req.tokenData;
    const { electronicId, review } = req.body;
    if (!isNotEmpty(review)) {
      return sendResponse(res, 400, false, "Please write a review.");
    }
    const electronic = await findElectronicByIdHelper(electronicId);
    if (!electronic) {
      return sendResponse(res, 404, false, "Electronic item not found.");
    }
    const newReview = { user: userId, reviewText: review };
    electronic.reviews.unshift(newReview);
    await electronic.save();
    return sendResponse(res, 200, true, "Successfully added your review.");
  }, res);
};

const searchElectronic = async (req, res) => {
  return asyncErrorHandler(async () => {
    const { query } = req.body;

    if (!query) {
      return sendResponse(res, 400, false, "Query parameter is required.");
    }

    const electronics = await searchElectronics(query);
    if (!electronics || electronics.length === 0) {
      return sendResponse(res, 404, false, "No electronics found.");
    }

    return sendResponse(
      res,
      200,
      true,
      "Successfully fetched electronics.",
      electronics
    );
  }, res);
};

module.exports = {
  addElectronic,
  editElectronic,
  getElectronics,
  getElectronicById,
  deleteElectronicImages,
  addElectronicReview,
  searchElectronic,
};
