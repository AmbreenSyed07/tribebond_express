/** @format */

const { asyncErrorHandler } = require("../helper/async-error.helper");
const { sendResponse } = require("../helper/local.helpers");
const { isNotEmpty } = require("../helper/validate.helpers");
const {
  createHelpRequest,
  findAndUpdateHelpRequest,
  findHelpRequestByIdHelper,
  findHelpRequestById,
  findHelpRequestsByCity,
  searchHelpRequests,
} = require("../service/askForHelp.service");
const {
  extractImageIdentifier,
  deleteImageFromStorage,
  uploadAndCreateImage,
} = require("../helper/upload.helpers");

const addHelpRequest = async (req, res) => {
  return asyncErrorHandler(async () => {
    const { _id: userId } = req.tokenData;
    const { name, description, address, city, phone, contactEmail, category } =
      req.body;
    let helpRequest_images = req && req.files && req.files.images;

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
      contactEmail,
      category,
      createdBy: userId,
    };

    const newHelpRequest = await createHelpRequest(info);
    if (!newHelpRequest) {
      return sendResponse(res, 400, false, "Unable to add new help request.");
    } else {
      if (helpRequest_images) {
        let imgArray = [];
        if (!helpRequest_images[0]) {
          let fileName = await uploadAndCreateImage(
            helpRequest_images,
            "helpRequest/images",
            newHelpRequest._id,
            res
          );
          imgArray.push(fileName);
        } else {
          for (let img of helpRequest_images) {
            let fileName = await uploadAndCreateImage(
              img,
              "helpRequest/images",
              newHelpRequest._id,
              res
            );
            imgArray.push(fileName);
          }
        }
        let updatedHelpRequest = await findAndUpdateHelpRequest(
          { _id: newHelpRequest._id },
          {
            images: imgArray,
          }
        );
        if (!updatedHelpRequest) {
          return sendResponse(res, 400, false, "Unable to save images.");
        }
      }

      return sendResponse(
        res,
        200,
        true,
        "Successfully added new help request.",
        newHelpRequest
      );
    }
  }, res);
};

const editHelpRequest = async (req, res) => {
  return asyncErrorHandler(async () => {
    const { id: helpRequestId } = req.params;
    const { _id: userId } = req.tokenData;
    const { name, description, address, city, phone, contactEmail, category } =
      req.body;

    const checkHelpRequest = await findHelpRequestByIdHelper(helpRequestId);
    if (!checkHelpRequest) {
      return sendResponse(res, 404, false, "Help request not found");
    }

    if (checkHelpRequest.createdBy.toString() !== userId.toString()) {
      return sendResponse(
        res,
        403,
        false,
        "You are not authorized to edit this help request."
      );
    }

    if (req.files) {
      const { images } = req.files;
      await editImage(helpRequestId, images, res);
    }

    const findInfo = { _id: helpRequestId, status: true };
    const setInfo = {
      name,
      description,
      address,
      city,
      phone,
      contactEmail,
      category,
      updatedBy: userId,
    };

    const helpRequest = await findAndUpdateHelpRequest(findInfo, setInfo);
    if (!helpRequest) {
      return sendResponse(
        res,
        400,
        false,
        "Unable to update help request info."
      );
    } else {
      return sendResponse(
        res,
        200,
        true,
        "Successfully updated help request info.",
        helpRequest
      );
    }
  }, res);
};

const editImage = async (helpRequestId, images, res) => {
  const helpRequest = await findHelpRequestByIdHelper(helpRequestId);
  if (!helpRequest) {
    return sendResponse(res, 400, false, "Help request not found.");
  }

  // Assuming images is an array of files
  const imagePaths = [];
  if (!images[0]) {
    let fileName = await uploadAndCreateImage(
      images,
      "helpRequest/images",
      helpRequestId,
      res
    );
    imagePaths.push(fileName);
  } else {
    for (let file of images) {
      let fileName = await uploadAndCreateImage(
        file,
        "helpRequest/images",
        helpRequestId,
        res
      );
      imagePaths.push(fileName);
    }
  }

  helpRequest.images = [...helpRequest.images, ...imagePaths];
  await helpRequest.save();
};

const getHelpRequests = async (req, res) => {
  return asyncErrorHandler(async () => {
    const { city } = req.tokenData;
    const helpRequests = await findHelpRequestsByCity(city);
    if (!helpRequests) {
      return sendResponse(res, 400, false, "No help requests found.");
    }

    return sendResponse(
      res,
      200,
      true,
      "Successfully fetched help requests.",
      helpRequests
    );
  }, res);
};

const getHelpRequestById = async (req, res) => {
  return asyncErrorHandler(async () => {
    let { id } = req.params;
    const helpRequest = await findHelpRequestById(id);
    if (!helpRequest) {
      return sendResponse(res, 400, false, "Help request not found.");
    }
    return sendResponse(
      res,
      200,
      true,
      "Successfully fetched help request.",
      helpRequest
    );
  }, res);
};

const deleteImages = async (req, res) => {
  return asyncErrorHandler(async () => {
    const { helpRequestId, imageUrls } = req.body;
    const { _id: userId } = req.tokenData;
    const helpRequest = await findHelpRequestByIdHelper(helpRequestId);
    if (!helpRequest) {
      return sendResponse(res, 404, false, "Help request not found");
    }
    if (helpRequest.createdBy.toString() !== userId.toString()) {
      return sendResponse(
        res,
        403,
        false,
        "You are not authorized to edit this help request."
      );
    }

    const deleteImagePromises = imageUrls.map(async (imageUrl) => {
      const imageIdentifier = extractImageIdentifier(imageUrl);
      const deletedImage = await deleteImageFromStorage(
        imageIdentifier,
        helpRequestId,
        "helpRequest/images"
      );
      helpRequest.images = helpRequest.images.filter(
        (img) => img !== imageIdentifier
      );
    });
    await Promise.all(deleteImagePromises);
    let updatedHelpRequest = await findAndUpdateHelpRequest(
      { _id: helpRequestId },
      helpRequest
    );
    if (!updatedHelpRequest) {
      return sendResponse(res, 404, false, "Unable to save changes.");
    }
    return sendResponse(res, 200, true, "Deleted successfully.");
  }, res);
};

const addReview = async (req, res) => {
  return asyncErrorHandler(async () => {
    const { _id: userId } = req.tokenData;
    const { helpRequestId, review } = req.body;
    if (!isNotEmpty(review)) {
      return sendResponse(res, 400, false, "Please write a review.");
    }
    const helpRequest = await findHelpRequestByIdHelper(helpRequestId);
    if (!helpRequest) {
      return sendResponse(res, 404, false, "Help request not found.");
    }
    const newReview = { user: userId, reviewText: review };
    helpRequest.reviews.unshift(newReview);
    await helpRequest.save();
    return sendResponse(res, 200, true, "Successfully added your review.");
  }, res);
};

const deleteHelpRequest = async (req, res) => {
  return asyncErrorHandler(async () => {
    const { id } = req.params;
    const { _id: userId } = req.tokenData;

    const helpRequest = await findHelpRequestByIdHelper({
      _id: id,
      status: true,
    });
    if (!helpRequest) {
      return sendResponse(res, 404, false, "Help request not found");
    }
    if (helpRequest.createdBy.toString() !== userId.toString()) {
      return sendResponse(
        res,
        403,
        false,
        "You are not authorized to delete this help request."
      );
    }

    const deleteHelpRequest = await findAndUpdateHelpRequest(
      { _id: id },
      {
        status: false,
        updatedBy: userId,
      }
    );
    if (!deleteHelpRequest) {
      return sendResponse(
        res,
        403,
        false,
        "Some error occurred, Please try again later."
      );
    }

    return sendResponse(res, 200, true, "Successfully deleted help request.");
  }, res);
};

module.exports = {
  addHelpRequest,
  editHelpRequest,
  getHelpRequests,
  getHelpRequestById,
  deleteImages,
  addReview,
  deleteHelpRequest,
};
