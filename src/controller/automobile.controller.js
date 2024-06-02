/** @format */

const { asyncErrorHandler } = require("../helper/async-error.helper");
const { sendResponse } = require("../helper/local.helpers");
const { isNotEmpty } = require("../helper/validate.helpers");
const {
  createAutomobile,
  findAndUpdateAutomobile,
  findAutomobileByIdHelper,
  findAutomobileById,
  findAutomobilesByCity,
  searchAutomobiles,
} = require("../service/automobile.service");
const {
  extractImageIdentifier,
  deleteImageFromStorage,
  uploadAndCreateImage,
} = require("../helper/upload.helpers");

const addAutomobile = async (req, res) => {
  return asyncErrorHandler(async () => {
    const { _id: userId } = req.tokenData;
    const { name, description, address, city, phone, website } = req.body;
    let automobile_images = req && req.files && req.files.images;

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

    const newAutomobile = await createAutomobile(info);
    if (!newAutomobile) {
      return sendResponse(res, 400, false, "Unable to add new automobile.");
    } else {
      if (automobile_images) {
        let imgArray = [];
        if (!automobile_images[0]) {
          let fileName = await uploadAndCreateImage(
            automobile_images,
            "automobile",
            newAutomobile._id,
            res
          );
          imgArray.push(fileName);
        } else {
          for (let img of automobile_images) {
            let fileName = await uploadAndCreateImage(
              img,
              "automobile",
              newAutomobile._id,
              res
            );
            imgArray.push(fileName);
          }
        }
        let updatedAutomobile = await findAndUpdateAutomobile(
          { _id: newAutomobile._id },
          { images: imgArray }
        );
        if (!updatedAutomobile) {
          return sendResponse(res, 400, false, "Unable to save images.");
        }
      }
      return sendResponse(
        res,
        200,
        true,
        "Successfully added new automobile.",
        newAutomobile
      );
    }
  }, res);
};

const editAutomobile = async (req, res) => {
  return asyncErrorHandler(async () => {
    const { id: automobileId } = req.params;
    const { _id: userId } = req.tokenData;
    const { name, description, address, city, phone, website } = req.body;

    const checkAutomobile = await findAutomobileByIdHelper(automobileId);
    if (!checkAutomobile) {
      return sendResponse(res, 404, false, "Automobile not found.");
    }

    // Check if the automobile's createdBy is equal to the user's id
    if (checkAutomobile.createdBy.toString() !== userId.toString()) {
      return sendResponse(
        res,
        403,
        false,
        "You are not authorized to edit this automobile."
      );
    }

    if (req.files) {
      const { images } = req.files;
      await editImage(automobileId, images, res);
    }

    const findInfo = { _id: automobileId, status: true };
    const setInfo = {
      name,
      description,
      address,
      city,
      phone,
      website,
      updatedBy: userId,
    };

    const automobile = await findAndUpdateAutomobile(findInfo, setInfo);
    if (!automobile) {
      return sendResponse(res, 400, false, "Unable to update automobile info.");
    } else {
      return sendResponse(
        res,
        200,
        true,
        "Successfully updated automobile info.",
        automobile
      );
    }
  }, res);
};

const editImage = async (automobileId, images, res) => {
  const automobile = await findAutomobileByIdHelper(automobileId);
  if (!automobile) {
    return sendResponse(res, 400, false, "Automobile not found.");
  }

  const imagePaths = [];
  if (!images[0]) {
    let fileName = await uploadAndCreateImage(
      images,
      "automobile",
      automobileId,
      res
    );
    imagePaths.push(fileName);
  } else {
    for (let file of images) {
      let fileName = await uploadAndCreateImage(
        file,
        "automobile",
        automobileId,
        res
      );
      imagePaths.push(fileName);
    }
  }

  automobile.images = [...automobile.images, ...imagePaths];
  await automobile.save();
};

const getAutomobiles = async (req, res) => {
  return asyncErrorHandler(async () => {
    const { city } = req.tokenData;

const { query } = req.query;

let automobiles;
if (query) {
  automobiles = await searchAutomobiles(query);
} else {
  automobiles = await findAutomobilesByCity(city);
}

    if (!automobiles) {
      return sendResponse(res, 400, false, "No automobiles found.");
    }

    return sendResponse(
      res,
      200,
      true,
      "Successfully fetched automobiles.",
      automobiles
    );
  }, res);
};

const getAutomobileById = async (req, res) => {
  return asyncErrorHandler(async () => {
    const { id } = req.params;
    const automobile = await findAutomobileById(id);
    if (!automobile) {
      return sendResponse(res, 400, false, "Automobile not found.");
    }
    return sendResponse(
      res,
      200,
      true,
      "Successfully fetched automobile.",
      automobile
    );
  }, res);
};

const deleteAutomobileImages = async (req, res) => {
  return asyncErrorHandler(async () => {
    const { automobileId, imageUrls } = req.body;
    const automobile = await findAutomobileByIdHelper(automobileId);
    if (!automobile) {
      return sendResponse(res, 404, false, "Automobile not found");
    }

    const deleteImagePromises = imageUrls.map(async (imageUrl) => {
      const imageIdentifier = extractImageIdentifier(imageUrl);
      await deleteImageFromStorage(imageIdentifier, automobileId, "automobile");
      automobile.images = automobile.images.filter(
        (img) => img !== imageIdentifier
      );
    });
    await Promise.all(deleteImagePromises);
    let updatedAutomobile = await findAndUpdateAutomobile(
      { _id: automobileId },
      automobile
    );
    if (!updatedAutomobile) {
      return sendResponse(res, 404, false, "Unable to save changes.");
    }
    return sendResponse(res, 200, true, "Deleted successfully.");
  }, res);
};

const addAutomobileReview = async (req, res) => {
  return asyncErrorHandler(async () => {
    const { _id: userId } = req.tokenData;
    const { automobileId, review } = req.body;
    if (!isNotEmpty(review)) {
      return sendResponse(res, 400, false, "Please write a review.");
    }
    const automobile = await findAutomobileByIdHelper(automobileId);
    if (!automobile) {
      return sendResponse(res, 404, false, "Automobile not found.");
    }
    const newReview = { user: userId, reviewText: review };
    automobile.reviews.unshift(newReview);
    await automobile.save();
    return sendResponse(res, 200, true, "Successfully added your review.");
  }, res);
};

const searchAutomobile = async (req, res) => {
  return asyncErrorHandler(async () => {
    const { query } = req.body;

    if (!query) {
      return sendResponse(res, 400, false, "Query parameter is required.");
    }

    const automobiles = await searchAutomobiles(query);
    if (!automobiles || automobiles.length === 0) {
      return sendResponse(res, 404, false, "No automobiles found.");
    }

    return sendResponse(
      res,
      200,
      true,
      "Successfully fetched automobiles.",
      automobiles
    );
  }, res);
};

module.exports = {
  addAutomobile,
  editAutomobile,
  getAutomobiles,
  getAutomobileById,
  deleteAutomobileImages,
  addAutomobileReview,
  searchAutomobile,
};
