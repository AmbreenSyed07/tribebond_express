/** @format */

const { asyncErrorHandler } = require("../helper/async-error.helper");
const { sendResponse } = require("../helper/local.helpers");
const {
  isNotEmpty,
  isWebsite,
  isEmail,
  isPhoneNo,
} = require("../helper/validate.helpers");
const {
  createHenna,
  findAndUpdateHenna,
  findHennaByIdHelper,
  findHennaById,
  findHennasByCity,
  searchHennas,
} = require("../service/henna.service");
const {
  extractImageIdentifier,
  deleteImageFromStorage,
  uploadAndCreateImage,
} = require("../helper/upload.helpers");

const addHenna = async (req, res) => {
  return asyncErrorHandler(async () => {
    const { _id: userId } = req.tokenData;
    const {
      name,
      description,
      address,
      city,
      phone,
      email,
      servingCities,
      website,
    } = req.body;
    let henna_images = req && req.files && req.files.images;

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
    } else if (!isNotEmpty(servingCities)) {
      return sendResponse(
        res,
        400,
        false,
        "Please enter the cities that you serve in."
      );
    } else if (!isWebsite(website)) {
      return sendResponse(res, 400, false, "Please enter a valid website url.");
    } else if (!henna_images || henna_images.length <= 0) {
      return sendResponse(res, 400, false, "Please select images.");
    }

    const info = {
      name,
      description,
      address,
      city,
      phone,
      email,
      servingCities,
      website,
      createdBy: userId,
    };

    const newHenna = await createHenna(info);
    if (!newHenna) {
      return sendResponse(res, 400, false, "Unable to add new henna.");
    } else {
      if (henna_images) {
        let imgArray = [];
        if (!henna_images[0]) {
          let fileName = await uploadAndCreateImage(
            henna_images,
            "henna",
            newHenna._id,
            res
          );
          imgArray.push(fileName);
        } else {
          for (let img of henna_images) {
            let fileName = await uploadAndCreateImage(
              img,
              "henna",
              newHenna._id,
              res
            );
            imgArray.push(fileName);
          }
        }
        let updatedHenna = await findAndUpdateHenna(
          { _id: newHenna._id },
          {
            images: imgArray,
          }
        );
        if (!updatedHenna) {
          return sendResponse(res, 400, false, "Unable to save images.");
        }
      }

      return sendResponse(
        res,
        200,
        true,
        "Successfully added new henna.",
        newHenna
      );
    }
  }, res);
};

const editHenna = async (req, res) => {
  return asyncErrorHandler(async () => {
    const { id: hennaId } = req.params;
    const { _id: userId } = req.tokenData;
    const {
      name,
      description,
      address,
      city,
      phone,
      email,
      servingCities,
      website,
    } = req.body;

    const checkHenna = await findHennaByIdHelper(hennaId);
    if (!checkHenna) {
      return sendResponse(res, 404, false, "Henna not found.");
    }
    if (checkHenna.createdBy.toString() !== userId.toString()) {
      return sendResponse(
        res,
        403,
        false,
        "You are not authorized to edit this Henna."
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
    } else if (!isNotEmpty(servingCities)) {
      return sendResponse(
        res,
        400,
        false,
        "Please enter the cities that you serve in."
      );
    } else if (!isWebsite(website)) {
      return sendResponse(res, 400, false, "Please enter a valid website url.");
    }

    if (req.files) {
      const { images } = req.files;
      await editImage(hennaId, images, res);
    }

    const findInfo = { _id: hennaId, status: true };
    const setInfo = {
      name,
      description,
      address,
      city,
      phone,
      email,
      servingCities,
      website,
      updatedBy: userId,
    };

    const henna = await findAndUpdateHenna(findInfo, setInfo);
    if (!henna) {
      return sendResponse(res, 400, false, "Unable to update henna info.");
    } else {
      return sendResponse(
        res,
        200,
        true,
        "Successfully updated henna info.",
        henna
      );
    }
  }, res);
};

const editImage = async (hennaId, images, res) => {
  const henna = await findHennaByIdHelper(hennaId);
  if (!henna) {
    return sendResponse(res, 400, false, "Henna not found.");
  }

  const imagePaths = [];
  if (!images[0]) {
    let fileName = await uploadAndCreateImage(images, "henna", hennaId, res);
    imagePaths.push(fileName);
  } else {
    for (let file of images) {
      let fileName = await uploadAndCreateImage(file, "henna", hennaId, res);
      imagePaths.push(fileName);
    }
  }

  henna.images = [...henna.images, ...imagePaths];
  await henna.save();
};

const getHennas = async (req, res) => {
  return asyncErrorHandler(async () => {
    const { city } = req.tokenData;

    const { query } = req.query;

    let hennas;
    if (query) {
      hennas = await searchHennas(query);
    } else {
      hennas = await findHennasByCity(city);
    }

    if (!hennas) {
      return sendResponse(res, 400, false, "No hennas found.");
    }

    return sendResponse(res, 200, true, "Successfully fetched hennas.", hennas);
  }, res);
};

const getHennaById = async (req, res) => {
  return asyncErrorHandler(async () => {
    let { id } = req.params;
    let henna = await findHennaById(id);
    if (!henna) {
      return sendResponse(res, 400, false, "Henna not found.");
    }
    return sendResponse(res, 200, true, "Successfully fetched henna.", henna);
  }, res);
};

const deleteHennaImages = async (req, res) => {
  return asyncErrorHandler(async () => {
    const { hennaId, imageUrls } = req.body;
    const { _id: userId } = req.tokenData;

    if (!hennaId) {
      return sendResponse(res, 400, false, "Please select a record id.");
    }

    const henna = await findHennaByIdHelper(hennaId);
    if (!henna) {
      return sendResponse(res, 404, false, "Henna not found");
    }

    if (henna.createdBy.toString() !== userId.toString()) {
      return sendResponse(
        res,
        403,
        false,
        "You are not authorized to delete images of this Henna."
      );
    } else if (!imageUrls || imageUrls.length <= 0) {
      return sendResponse(res, 400, false, "Please select images to delete.");
    }

    const deleteImagePromises = imageUrls.map(async (imageUrl) => {
      const imageIdentifier = extractImageIdentifier(imageUrl);
      const deletedImage = await deleteImageFromStorage(
        imageIdentifier,
        hennaId,
        "henna"
      );
      henna.images = henna.images.filter((img) => img !== imageIdentifier);
    });
    await Promise.all(deleteImagePromises);
    let updatedHenna = await findAndUpdateHenna({ _id: hennaId }, henna);
    if (!updatedHenna) {
      return sendResponse(res, 404, false, "Unable to save changes.");
    }
    return sendResponse(res, 200, true, "Deleted successfully.");
  }, res);
};

const addHennaReview = async (req, res) => {
  return asyncErrorHandler(async () => {
    const { _id: userId } = req.tokenData;
    let { hennaId, review } = req.body;
    if (!hennaId) {
      return sendResponse(res, 400, false, "Please select a record id.");
    }
    if (!isNotEmpty(review)) {
      return sendResponse(res, 400, false, "Please write a review.");
    }
    let henna = await findHennaByIdHelper(hennaId);
    if (!henna) {
      return sendResponse(res, 404, false, "Henna not found.");
    }
    let newReview = { user: userId, reviewText: review };
    henna.reviews.unshift(newReview);
    await henna.save();
    return sendResponse(res, 200, true, "Successfully added your review.");
  }, res);
};

const searchHenna = async (req, res) => {
  return asyncErrorHandler(async () => {
    const { query } = req.body;

    if (!query) {
      return sendResponse(res, 400, false, "Query parameter is required.");
    }

    const hennas = await searchHennas(query);
    if (!hennas || hennas.length === 0) {
      return sendResponse(res, 404, false, "No hennas found.");
    }

    return sendResponse(res, 200, true, "Successfully fetched hennas.", hennas);
  }, res);
};

const deleteHenna = async (req, res) => {
  return asyncErrorHandler(async () => {
    const { id } = req.params;
    const { _id: userId } = req.tokenData;

    const henna = await findHennaByIdHelper(id);
    if (!henna) {
      return sendResponse(res, 404, false, "Record not found");
    }
    if (henna.createdBy.toString() !== userId.toString()) {
      return sendResponse(
        res,
        403,
        false,
        "You are not authorized to delete this record."
      );
    }

    const deletedHenna = await findAndUpdateHenna(
      { _id: id },
      {
        status: false,
        updatedBy: userId,
      }
    );
    if (!deletedHenna) {
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
  addHenna,
  editHenna,
  getHennas,
  getHennaById,
  deleteHennaImages,
  addHennaReview,
  searchHenna,
  deleteHenna,
};
