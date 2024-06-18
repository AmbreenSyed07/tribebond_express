/** @format */

const { asyncErrorHandler } = require("../helper/async-error.helper");
const { sendResponse } = require("../helper/local.helpers");
const { isNotEmpty, isPhoneNo } = require("../helper/validate.helpers");
const {
  createVolunteerEvent,
  findAndUpdateVolunteerEvent,
  findVolunteerEventByIdHelper,
  findVolunteerEventById,
  findVolunteerEventsByCity,
  searchVolunteerEvents,
} = require("../service/volunteerEvent.service");
const {
  extractImageIdentifier,
  deleteImageFromStorage,
  uploadAndCreateImage,
} = require("../helper/upload.helpers");

const addVolunteerEvent = async (req, res) => {
  return asyncErrorHandler(async () => {
    const { _id: userId } = req.tokenData;
    const { name, description, date, time, address, city, phone, website } =
      req.body;
    let volunteer_images = req && req.files && req.files.images;

    if (!isNotEmpty(name)) {
      return sendResponse(res, 400, false, "Please enter the name.");
    } else if (!isNotEmpty(date)) {
      return sendResponse(res, 400, false, "Please enter the date.");
    } else if (!isNotEmpty(time)) {
      return sendResponse(res, 400, false, "Please enter the time.");
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
      return sendResponse(res, 400, false, "Please enter a valid website url.");
    } else if (!volunteer_images || volunteer_images.length <= 0) {
      return sendResponse(res, 400, false, "Please select images.");
    }

    const info = {
      name,
      description,
      date,
      time,
      address,
      city,
      phone,
      website,
      createdBy: userId,
    };

    const newVolunteerEvent = await createVolunteerEvent(info);
    if (!newVolunteerEvent) {
      return sendResponse(
        res,
        400,
        false,
        "Unable to add new volunteer event."
      );
    } else {
      if (volunteer_images) {
        let imgArray = [];
        if (!volunteer_images[0]) {
          let fileName = await uploadAndCreateImage(
            volunteer_images,
            "volunteer/images",
            newVolunteerEvent._id,
            res
          );
          imgArray.push(fileName);
        } else {
          for (let img of volunteer_images) {
            let fileName = await uploadAndCreateImage(
              img,
              "volunteer/images",
              newVolunteerEvent._id,
              res
            );
            imgArray.push(fileName);
          }
        }
        let updatedVolunteerEvent = await findAndUpdateVolunteerEvent(
          { _id: newVolunteerEvent._id },
          {
            images: imgArray,
          }
        );
        if (!updatedVolunteerEvent) {
          return sendResponse(res, 400, false, "Unable to save images.");
        }
      }

      return sendResponse(
        res,
        200,
        true,
        "Successfully added new volunteer event.",
        newVolunteerEvent
      );
    }
  }, res);
};

const editVolunteerEvent = async (req, res) => {
  return asyncErrorHandler(async () => {
    const { id: volunteerEventId } = req.params;
    const { _id: userId } = req.tokenData;
    const { name, description, date, time, address, city, phone, website } =
      req.body;

    const checkVolunteerEvent = await findVolunteerEventByIdHelper(
      volunteerEventId
    );
    if (!checkVolunteerEvent) {
      return sendResponse(res, 404, false, "Volunteer event not found");
    }

    if (checkVolunteerEvent.createdBy.toString() !== userId.toString()) {
      return sendResponse(
        res,
        403,
        false,
        "You are not authorized to edit this record."
      );
    }

    if (!isNotEmpty(name)) {
      return sendResponse(res, 400, false, "Please enter the name.");
    } else if (!isNotEmpty(date)) {
      return sendResponse(res, 400, false, "Please enter the date.");
    } else if (!isNotEmpty(time)) {
      return sendResponse(res, 400, false, "Please enter the time.");
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
      return sendResponse(res, 400, false, "Please enter a valid website url.");
    }

    if (req.files) {
      const { images } = req.files;
      await editImage(volunteerEventId, images, res);
    }

    const findInfo = { _id: volunteerEventId, status: true };
    const setInfo = {
      name,
      description,
      date,
      time,
      address,
      city,
      phone,
      website,
      updatedBy: userId,
    };

    const volunteerEvent = await findAndUpdateVolunteerEvent(findInfo, setInfo);
    if (!volunteerEvent) {
      return sendResponse(
        res,
        400,
        false,
        "Unable to update volunteer event info."
      );
    } else {
      return sendResponse(
        res,
        200,
        true,
        "Successfully updated volunteer event info.",
        volunteerEvent
      );
    }
  }, res);
};

const editImage = async (volunteerEventId, images, res) => {
  const volunteerEvent = await findVolunteerEventByIdHelper(volunteerEventId);
  if (!volunteerEvent) {
    return sendResponse(res, 400, false, "Volunteer event not found.");
  }

  // Assuming images is an array of files
  const imagePaths = [];
  if (!images[0]) {
    let fileName = await uploadAndCreateImage(
      images,
      "volunteer/images",
      volunteerEventId,
      res
    );
    imagePaths.push(fileName);
  } else {
    for (let file of images) {
      let fileName = await uploadAndCreateImage(
        file,
        "volunteer/images",
        volunteerEventId,
        res
      );
      imagePaths.push(fileName);
    }
  }

  volunteerEvent.images = [...volunteerEvent.images, ...imagePaths];
  await volunteerEvent.save();
};

const getVolunteerEvents = async (req, res) => {
  return asyncErrorHandler(async () => {
    const { city } = req.tokenData;
    const { query } = req.query;

    let volunteerEvents;
    if (query) {
      volunteerEvents = await searchVolunteerEvents(query);
    } else {
      volunteerEvents = await findVolunteerEventsByCity(city);
    }
    if (!volunteerEvents) {
      return sendResponse(res, 400, false, "No volunteer events found.");
    }

    return sendResponse(
      res,
      200,
      true,
      "Successfully fetched volunteer events.",
      volunteerEvents
    );
  }, res);
};

const getVolunteerEventById = async (req, res) => {
  return asyncErrorHandler(async () => {
    let { id } = req.params;
    const volunteerEvent = await findVolunteerEventById(id);
    if (!volunteerEvent) {
      return sendResponse(res, 400, false, "Volunteer event not found.");
    }
    return sendResponse(
      res,
      200,
      true,
      "Successfully fetched volunteer event.",
      volunteerEvent
    );
  }, res);
};

const deleteImages = async (req, res) => {
  return asyncErrorHandler(async () => {
    const { volunteerEventId, imageUrls } = req.body;
    const { _id: userId } = req.tokenData;
    const volunteerEvent = await findVolunteerEventByIdHelper(volunteerEventId);
    if (!volunteerEvent) {
      return sendResponse(res, 404, false, "Volunteer event not found");
    }
    if (volunteerEvent.createdBy.toString() !== userId.toString()) {
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
        volunteerEventId,
        "volunteer/images"
      );
      volunteerEvent.images = volunteerEvent.images.filter(
        (img) => img !== imageIdentifier
      );
    });
    await Promise.all(deleteImagePromises);
    let updatedVolunteerEvent = await findAndUpdateVolunteerEvent(
      { _id: volunteerEventId },
      volunteerEvent
    );
    if (!updatedVolunteerEvent) {
      return sendResponse(res, 404, false, "Unable to save changes.");
    }
    return sendResponse(res, 200, true, "Deleted successfully.");
  }, res);
};

const addReview = async (req, res) => {
  return asyncErrorHandler(async () => {
    const { _id: userId } = req.tokenData;
    const { volunteerEventId, review } = req.body;
    if (!isNotEmpty(review)) {
      return sendResponse(res, 400, false, "Please write a review.");
    }
    const volunteerEvent = await findVolunteerEventByIdHelper(volunteerEventId);
    if (!volunteerEvent) {
      return sendResponse(res, 404, false, "Volunteer event not found.");
    }
    const newReview = { user: userId, reviewText: review };
    volunteerEvent.reviews.unshift(newReview);
    await volunteerEvent.save();
    return sendResponse(res, 200, true, "Successfully added your review.");
  }, res);
};

const deleteVolunteerEvent = async (req, res) => {
  return asyncErrorHandler(async () => {
    const { id } = req.params;
    const { _id: userId } = req.tokenData;

    const volunteerEvent = await findVolunteerEventByIdHelper({
      _id: id,
      status: true,
    });
    if (!volunteerEvent) {
      return sendResponse(res, 404, false, "Volunteer event not found");
    }
    if (volunteerEvent.createdBy.toString() !== userId.toString()) {
      return sendResponse(
        res,
        403,
        false,
        "You are not authorized to delete this record."
      );
    }

    const deleteVolunteerEvent = await findAndUpdateVolunteerEvent(
      { _id: id },
      {
        status: false,
        updatedBy: userId,
      }
    );
    if (!deleteVolunteerEvent) {
      return sendResponse(
        res,
        403,
        false,
        "Some error occurred, Please try again later."
      );
    }

    return sendResponse(
      res,
      200,
      true,
      "Successfully deleted volunteer event."
    );
  }, res);
};

module.exports = {
  addVolunteerEvent,
  editVolunteerEvent,
  getVolunteerEvents,
  getVolunteerEventById,
  deleteImages,
  addReview,
  deleteVolunteerEvent,
};
