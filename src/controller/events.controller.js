const { asyncErrorHandler } = require("../helper/async-error.helper");
const { sendResponse } = require("../helper/local.helpers");
const { isNotEmpty } = require("../helper/validate.helpers");
const {
  createEvent,
  findAndUpdateEvent,
  findEventByCity,
} = require("../service/event.service");
const { fileUpload } = require("../helper/upload.helpers");

const addEvent = async (req, res) => {
  return asyncErrorHandler(async () => {
    const { _id } = req.tokenData._doc;
    const { name, date, time, address, city, phone } = req.body;
    let thumbnail = req.files && req.files.thumbnail;

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
    }
    const info = {
      name,
      date,
      time,
      address,
      city,
      phone,
      createdBy: _id,
    };
 
    
    const newEvent = await createEvent(info);
    if (!newEvent) {
      return sendResponse(res, 400, false, "Unable to add new event.");
    } else {
      if (thumbnail) {
        const newFile = await fileUpload(
          thumbnail,
          `event-thumbnail/${newEvent._id}/`,
          ["jpg", "jpeg", "png", "gif", "webp", "avif"],
          true,
          undefined,
          undefined,
          0,
          10
        );
        if (newFile.ok === false) {
          return sendResponse(res, 400, false, newFile.message);
        }
        thumbnail = newFile.fileName;
      }

      if (thumbnail) {
        let updatedEvent = await findAndUpdateEvent(
          { _id: newEvent },
          {
            thumbnail: thumbnail,
          }
        );
        if (!updatedEvent) {
          return sendResponse(res, 400, false, "Unable to save thumbnail.");
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

const editEvent = async (req, res) => {
  return asyncErrorHandler(async () => {
    const { id } = req.params;
    const { _id } = req.tokenData;
    const { name, date, time, address, city, phone } = req.body;

    const findInfo = { _id: id };
    const setInfo = {
      name,
      date,
      time,
      address,
      city,
      phone,
      updatedBy: _id,
    };

    const event = await findAndUpdateEvent(findInfo, setInfo);
    if (!event) {
      return sendResponse(res, 400, false, "Unable to update event.");
    }

    return sendResponse(res, 200, true, "Successfully updated event.", event);
  }, res);
};

const getEvents = async (req, res) => {
  return asyncErrorHandler(async () => {
    const { city } = req.tokenData._doc;
    const events = await findEventByCity(city);
    if (!events) {
      return sendResponse(res, 400, false, "No events found.");
    }

    return sendResponse(res, 200, true, "Successfully fetched events.", events);
  }, res);
};

const deleteEvent = async (req, res) => {
  return asyncErrorHandler(async () => {
    const { id } = req.params;
    const { _id } = req.tokenData;

    // updatedBy

    const findInfo = { _id: id };
    const setInfo = { status: 0, updatedBy: _id };

    const event = await findAndUpdateEvent(findInfo, setInfo);
    if (!event) {
      return sendResponse(res, 400, false, "Unable to delete event.");
    }

    return sendResponse(res, 200, true, "Successfully deleted event.");
  }, res);
};

module.exports = { addEvent, editEvent, getEvents, deleteEvent };
