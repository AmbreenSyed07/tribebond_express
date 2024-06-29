const { asyncHandler } = require("../helper/async-error.helper");
const { modifyResponse } = require("../helper/local.helpers");
const Event = require("../model/events.model");

const createEvent = async (info) => {
  return asyncHandler(async () => {
    const event = new Event(info);

    const savedEvent = await event.save();
    return savedEvent instanceof Event ? savedEvent.toJSON() : false;
  });
};

const findAndUpdateEvent = async (findInfo, setInfo) => {
  return asyncHandler(async () => {
    const event = await Event.findOneAndUpdate(
      findInfo, // Match both ID and Type
      {
        $set: setInfo,
      },
      { new: true, runValidators: true } // Options to return the updated document and run schema validators
    );
    return event ? event : false;
  });
};

const findEventById = async (id) => {
  return asyncHandler(async () => {
    const event = await Event.findOne({ _id: id, status: 1 })
      .populate("reviews.user", "firstName lastName profilePicture")
      .populate("createdBy", "firstName lastName profilePicture")
      .exec();
    return event ? modifyResponse([event], "event-image") : false;
  });
};

const findEventByCity = async (city) => {
  return asyncHandler(async () => {
    const events = await Event.find({
      city: { $regex: `^${city}$`, $options: "i" },
      status: 1,
    })
      .collation({ locale: "en", strength: 2 })
      .populate("reviews.user", "firstName lastName profilePicture")
      .populate("createdBy", "firstName lastName profilePicture")
      .sort({ createdAt: -1 })
      .exec();
    return events.length > 0 ? modifyResponse(events, "event-image") : false;
  });
};

const findEventByIdHelper = async (id) => {
  return asyncHandler(async () => {
    const event = await Event.findOne({ _id: id, status: 1 });
    return event ? event : false;
  });
};

module.exports = {
  createEvent,
  findAndUpdateEvent,
  findEventByCity,
  findEventById,
  findEventByIdHelper,
};
