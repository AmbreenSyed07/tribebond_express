/** @format */

const { asyncErrorHandler } = require("../helper/async-error.helper");
const { sendResponse } = require("../helper/local.helpers");
const { isNotEmpty } = require("../helper/validate.helpers");
const {
  createQurbani,
  findAndUpdateQurbani,
  findQurbaniByIdHelper,
  findQurbaniById,
  findQurbanisByCity,
  searchQurbanis,
} = require("../service/qurbani.service");
const {
  extractImageIdentifier,
  deleteImageFromStorage,
  uploadAndCreateImage,
} = require("../helper/upload.helpers");

const addQurbani = async (req, res) => {
  return asyncErrorHandler(async () => {
    const { _id: userId } = req.tokenData;
    const { name, description, address, city, phone, website } = req.body;
    let qurbani_images = req && req.files && req.files.images;

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

    const newQurbani = await createQurbani(info);
    if (!newQurbani) {
      return sendResponse(res, 400, false, "Unable to add new qurbani.");
    } else {
      if (qurbani_images) {
        let imgArray = [];
        if (!qurbani_images[0]) {
          let fileName = await uploadAndCreateImage(
            qurbani_images,
            "qurbani",
            newQurbani._id,
            res
          );
          imgArray.push(fileName);
        } else {
          for (let img of qurbani_images) {
            let fileName = await uploadAndCreateImage(
              img,
              "qurbani",
              newQurbani._id,
              res
            );
            imgArray.push(fileName);
          }
        }
        let updatedQurbani = await findAndUpdateQurbani(
          { _id: newQurbani._id },
          {
            images: imgArray,
          }
        );
        if (!updatedQurbani) {
          return sendResponse(res, 400, false, "Unable to save images.");
        }
      }

      return sendResponse(
        res,
        200,
        true,
        "Successfully added new qurbani.",
        newQurbani
      );
    }
  }, res);
};

const editQurbani = async (req, res) => {
  return asyncErrorHandler(async () => {
    const { id: qurbaniId } = req.params;
    const { _id: userId } = req.tokenData;
    const { name, description, address, city, phone, website } = req.body;

    const checkQurbani = await findQurbaniByIdHelper(qurbaniId);
    if (!checkQurbani) {
      return sendResponse(res, 404, false, "Qurbani not found.");
    }
    // Check if the Qurbani's createdBy is equal to the user's id
    if (checkQurbani.createdBy.toString() !== userId.toString()) {
      return sendResponse(
        res,
        403,
        false,
        "You are not authorized to edit this Qurbani."
      );
    }

    if (req.files) {
      const { images } = req.files;
      await editImage(qurbaniId, images, res);
    }

    const findInfo = { _id: qurbaniId, status: true };
    const setInfo = {
      name,
      description,
      address,
      city,
      phone,
      website,
      updatedBy: userId,
    };

    const qurbani = await findAndUpdateQurbani(findInfo, setInfo);
    if (!qurbani) {
      return sendResponse(res, 400, false, "Unable to update qurbani info.");
    } else {
      return sendResponse(
        res,
        200,
        true,
        "Successfully updated qurbani info.",
        qurbani
      );
    }
  }, res);
};

const editImage = async (qurbaniId, images, res) => {
  const qurbani = await findQurbaniByIdHelper(qurbaniId);
  if (!qurbani) {
    return sendResponse(res, 400, false, "Qurbani not found.");
  }

  // Assuming images is an array of files
  const imagePaths = [];
  if (!images[0]) {
    let fileName = await uploadAndCreateImage(
      images,
      "qurbani",
      qurbaniId,
      res
    );
    imagePaths.push(fileName);
  } else {
    for (let file of images) {
      let fileName = await uploadAndCreateImage(
        file,
        "qurbani",
        qurbaniId,
        res
      );
      imagePaths.push(fileName);
    }
  }

  qurbani.images = [...qurbani.images, ...imagePaths];
  await qurbani.save();
};

const getQurbanis = async (req, res) => {
  return asyncErrorHandler(async () => {
    const { city } = req.tokenData;

     const { query } = req.query;

     let qurbanis;
     if (query) {
       qurbanis = await searchQurbanis(query);
     } else {
       qurbanis = await findQurbanisByCity(city);
     }

  
    if (!qurbanis) {
      return sendResponse(res, 400, false, "No qurbanis found.");
    }

    return sendResponse(
      res,
      200,
      true,
      "Successfully fetched qurbanis.",
      qurbanis
    );
  }, res);
};

const getQurbaniById = async (req, res) => {
  return asyncErrorHandler(async () => {
    let { id } = req.params;
    const qurbani = await findQurbaniById(id);
    if (!qurbani) {
      return sendResponse(res, 400, false, "Qurbani not found.");
    }
    return sendResponse(
      res,
      200,
      true,
      "Successfully fetched qurbani.",
      qurbani
    );
  }, res);
};

const deleteQurbaniImages = async (req, res) => {
  return asyncErrorHandler(async () => {
    const { qurbaniId, imageUrls } = req.body;
    const { _id: userId } = req.tokenData;
    const qurbani = await findQurbaniByIdHelper(qurbaniId);
    if (!qurbani) {
      return sendResponse(res, 404, false, "Qurbani not found");
    }

    // Check if the Qurbani's createdBy is equal to the user's id
    if (qurbani.createdBy.toString() !== userId.toString()) {
      return sendResponse(
        res,
        403,
        false,
        "You are not authorized to edit this Qurbani."
      );
    }

    const deleteImagePromises = imageUrls.map(async (imageUrl) => {
      const imageIdentifier = extractImageIdentifier(imageUrl);
      const deletedImage = await deleteImageFromStorage(
        imageIdentifier,
        qurbaniId,
        "qurbani"
      );
      qurbani.images = qurbani.images.filter((img) => img !== imageIdentifier);
    });
    await Promise.all(deleteImagePromises);
    let updatedQurbani = await findAndUpdateQurbani(
      { _id: qurbaniId },
      qurbani
    );
    if (!updatedQurbani) {
      return sendResponse(res, 404, false, "Unable to save changes.");
    }
    return sendResponse(res, 200, true, "Deleted successfully.");
  }, res);
};

const addQurbaniReview = async (req, res) => {
  return asyncErrorHandler(async () => {
    const { _id: userId } = req.tokenData;
    const { qurbaniId, review } = req.body;
    if (!isNotEmpty(review)) {
      return sendResponse(res, 400, false, "Please write a review.");
    }
    const qurbani = await findQurbaniByIdHelper(qurbaniId);
    if (!qurbani) {
      return sendResponse(res, 404, false, "Qurbani not found.");
    }
    const newReview = { user: userId, reviewText: review };
    qurbani.reviews.unshift(newReview);
    await qurbani.save();
    return sendResponse(res, 200, true, "Successfully added your review.");
  }, res);
};

const searchQurbani = async (req, res) => {
  return asyncErrorHandler(async () => {
    const { query } = req.body;

    if (!query) {
      return sendResponse(res, 400, false, "Query parameter is required.");
    }

    const qurbanis = await searchQurbanis(query);
    if (!qurbanis || qurbanis.length === 0) {
      return sendResponse(res, 404, false, "No qurbanis found.");
    }

    return sendResponse(
      res,
      200,
      true,
      "Successfully fetched qurbanis.",
      qurbanis
    );
  }, res);
};

module.exports = {
  addQurbani,
  editQurbani,
  getQurbanis,
  getQurbaniById,
  deleteQurbaniImages,
  addQurbaniReview,
  searchQurbani,
};
