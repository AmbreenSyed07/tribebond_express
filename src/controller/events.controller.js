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
    const { _id: userId } = req.tokenData._doc;
    const { name, description, date, time, address, city, phone, website } =
      req.body;
    let event_thumbnail = req && req.files && req.files.thumbnail;
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
      let thumbnail;
      if (event_thumbnail) {
        const newFile = await fileUpload(
          event_thumbnail,
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
          { _id: newEvent._id },
          {
            thumbnail: thumbnail,
          }
        );
        if (!updatedEvent) {
          return sendResponse(res, 400, false, "Unable to save thumbnail.");
        }
      }
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
    // if success, return the name and push it in array, upload array in db

    // return newFile.ok === true ? newFile.fileName : false;

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

    // let img_name = newFile.fileName;
    // await QueryCreateRoomImg({
    //   event_id,
    //   image_name: img_name,
    //   priority: key + 1,
    //   eat: currentDateTime,
    //   eby,
    // });
    // }
  }
};

const editEvent = async (req, res) => {
  return asyncErrorHandler(async () => {
    const { id } = req.params;
    const { _id } = req.tokenData;
    const { name, description, date, time, address, city, phone, website } =
      req.body;

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
