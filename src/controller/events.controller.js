const { asyncErrorHandler } = require("../helper/async-error.helper");
const { sendResponse } = require("../helper/local.helpers");
const { isNotEmpty, isPhoneNo } = require("../helper/validate.helpers");
const {
  createEvent,
  findAndUpdateEvent,
  findEventByCity,
  findEventById,
  findEventByIdHelper,
} = require("../service/event.service");
const {
  fileUpload,
  extractImageIdentifier,
  deleteImageFromStorage,
} = require("../helper/upload.helpers");
const Event = require("../model/events.model");

const addEvent = async (req, res) => {
  return asyncErrorHandler(async () => {
    const { _id: userId } = req.tokenData;
    const { name, description, date, time, address, city, phone, website } =
      req.body;
    let event_images = req && req.files && req.files.images;

    if (!isNotEmpty(name)) {
      return sendResponse(
        res,
        400,
        false,
        "Please enter a name for the event."
      );
    } else if (!isNotEmpty(date)) {
      return sendResponse(
        res,
        400,
        false,
        "Please enter a date for the event."
      );
    } else if (!isNotEmpty(time)) {
      return sendResponse(
        res,
        400,
        false,
        "Please enter a time for the event."
      );
    } else if (!isNotEmpty(address)) {
      return sendResponse(
        res,
        400,
        false,
        "Please enter an address for the event."
      );
    } else if (!isNotEmpty(city)) {
      return sendResponse(
        res,
        400,
        false,
        "Please enter a city for the event."
      );
    } else if (!isNotEmpty(phone) || !isPhoneNo(phone)) {
      return sendResponse(
        res,
        400,
        false,
        "Please enter a valid phone number for the event."
      );
    } else if (!isNotEmpty(website)) {
      return sendResponse(
        res,
        400,
        false,
        "Please enter a valid website for the event."
      );
    } else if (!event_images) {
      return sendResponse(
        res,
        400,
        false,
        "Please select images for the event."
      );
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

    const newEvent = await createEvent(info);
    if (!newEvent) {
      return sendResponse(res, 400, false, "Unable to add new event.");
    } else {
      if (event_images) {
        let imgArray = [];
        if (!event_images[0]) {
          let fileName = await uploadAndCreateImage(
            event_images,
            newEvent._id,
            res
          );
          imgArray.push(fileName);
        } else {
          for (let img of event_images) {
            let fileName = await uploadAndCreateImage(img, newEvent._id, res);
            imgArray.push(fileName);
          }
        }
        let updatedEvent = await findAndUpdateEvent(
          { _id: newEvent._id },
          {
            images: imgArray,
          }
        );
        if (!updatedEvent) {
          return sendResponse(res, 400, false, "Unable to save images.");
        }
      }

      return sendResponse(
        res,
        200,
        true,
        "Successfully added new event.",
        newEvent
      );
    }
  }, res);
};

const uploadAndCreateImage = async (file, event_id, res) => {
  if (file) {
    const newFile = await fileUpload(
      file,
      `event-image/${event_id}/`,
      ["jpg", "jpeg", "png", "gif", "webp", "avif"],
      false
    );

    if (newFile.ok === true) {
      return newFile.fileName;
    } else {
      return sendResponse(
        res,
        400,
        false,
        "Unable to save images. Please try again"
      );
    }
  }
};

const editEvent = async (req, res) => {
  return asyncErrorHandler(async () => {
    const { id } = req.params;
    const { _id } = req.tokenData;
    const { name, description, date, time, address, city, phone, website } =
      req.body;

    const checkEvent = await findEventByIdHelper(id);
    if (!checkEvent) {
      return sendResponse(res, 404, false, "Event not found");
    }

    if (checkEvent.createdBy.toString() !== _id.toString()) {
      return sendResponse(
        res,
        403,
        false,
        "You are not authorized to edit this record."
      );
    }

    if (!isNotEmpty(name)) {
      return sendResponse(
        res,
        400,
        false,
        "Please enter a name for the event."
      );
    } else if (!isNotEmpty(date)) {
      return sendResponse(
        res,
        400,
        false,
        "Please enter a date for the event."
      );
    } else if (!isNotEmpty(time)) {
      return sendResponse(
        res,
        400,
        false,
        "Please enter a time for the event."
      );
    } else if (!isNotEmpty(address)) {
      return sendResponse(
        res,
        400,
        false,
        "Please enter an address for the event."
      );
    } else if (!isNotEmpty(city)) {
      return sendResponse(
        res,
        400,
        false,
        "Please enter a city for the event."
      );
    } else if (!isNotEmpty(phone) || !isPhoneNo(phone)) {
      return sendResponse(
        res,
        400,
        false,
        "Please enter a valid phone number for the event."
      );
    } else if (!isNotEmpty(website)) {
      return sendResponse(
        res,
        400,
        false,
        "Please enter a valid website for the event."
      );
    }

    if (req.files) {
      const { images } = req.files;
      await editImage(id, images, res);
    }

    const findInfo = { _id: id };
    const setInfo = {
      name,
      description,
      date,
      time,
      address,
      city,
      phone,
      website,
      updatedBy: _id,
    };

    const event = await findAndUpdateEvent(findInfo, setInfo);
    if (!event) {
      return sendResponse(res, 400, false, "Unable to update event.");
    }

    return sendResponse(res, 200, true, "Successfully updated event.", event);
  }, res);
};

const editImage = async (eventId, images, res) => {
  const event = await Event.findById(eventId);
  if (!event) {
    return sendResponse(res, 400, false, "Event not found.");
  }

  // Assuming images is an array of files
  const imagePaths = [];
  if (!images[0]) {
    let fileName = await uploadAndCreateImage(file, eventId, res);
    imagePaths.push(fileName);
  } else {
    for (let file of images) {
      let fileName = await uploadAndCreateImage(file, eventId, res);
      imagePaths.push(fileName);
    }
  }

  event.images = [...event.images, ...imagePaths];
  await event.save();
};

const getEvents = async (req, res) => {
  return asyncErrorHandler(async () => {
    const { city } = req.tokenData;
    const events = await findEventByCity(city);
    if (!events) {
      return sendResponse(res, 400, false, "No events found.");
    }

    return sendResponse(res, 200, true, "Successfully fetched events.", events);
  }, res);
};

const getEventById = async (req, res) => {
  return asyncErrorHandler(async () => {
    let { id } = req.params;
    const event = await findEventById(id);
    if (!event) {
      return sendResponse(res, 400, false, "No event found.");
    }
    return sendResponse(res, 200, true, "Successfully fetched event.", event);
  }, res);
};

const deleteEvent = async (req, res) => {
  return asyncErrorHandler(async () => {
    const { id } = req.params;

    const { _id } = req.tokenData;

    const checkEvent = await findEventByIdHelper(id);
    if (!checkEvent) {
      return sendResponse(res, 404, false, "Event not found");
    }

    if (checkEvent.createdBy.toString() !== _id.toString()) {
      return sendResponse(
        res,
        403,
        false,
        "You are not authorized to delete this record."
      );
    }

    const findInfo = { _id: id };
    const setInfo = { status: 0, updatedBy: _id };

    const event = await findAndUpdateEvent(findInfo, setInfo);
    if (!event) {
      return sendResponse(res, 400, false, "Unable to delete event.");
    }

    return sendResponse(res, 200, true, "Successfully deleted event.");
  }, res);
};

const deleteImages = async (req, res) => {
  return asyncErrorHandler(async () => {
    const { eventId, imageUrls } = req.body;
    const { _id } = req.tokenData;
    const event = await Event.findById(eventId);
    if (!event) {
      return sendResponse(res, 404, false, "Event not found");
    }

    if (event.createdBy.toString() !== _id.toString()) {
      return sendResponse(
        res,
        403,
        false,
        "You are not authorized to delete images for this record."
      );
    }

    const deleteImagePromises = imageUrls.map(async (imageUrl) => {
      const imageIdentifier = extractImageIdentifier(imageUrl);
      const deletedImage = await deleteImageFromStorage(
        imageIdentifier,
        eventId,
        "event-image"
      );
      event.images = event.images.filter((img) => img !== imageIdentifier);
    });
    await Promise.all(deleteImagePromises);
    let updatedEvent = await findAndUpdateEvent({ _id: eventId }, event); //will update the existing event, as event is an instance of existing one
    if (!updatedEvent) {
      return sendResponse(res, 404, false, "Unable to save changes.");
    }
    return sendResponse(res, 200, true, "Deleted successfully.");
  }, res);
};

const addReview = async (req, res) => {
  return asyncErrorHandler(async () => {
    const { _id: userId } = req.tokenData;
    const { eventId, review } = req.body;
    if (!isNotEmpty(review)) {
      return sendResponse(res, 400, false, "Please write a review.");
    }
    const event = await findEventByIdHelper(eventId);
    if (!event) {
      return sendResponse(res, 404, false, "Event not found");
    }
    const newReview = { user: userId, reviewText: review };
    event.reviews.unshift(newReview);
    await event.save();
    return sendResponse(res, 200, true, "Successfully added your review.");
  }, res);
};

module.exports = {
  addEvent,
  editEvent,
  getEvents,
  getEventById,
  deleteEvent,
  deleteImages,
  addReview,
};
