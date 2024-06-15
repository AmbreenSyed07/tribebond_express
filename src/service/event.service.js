const { asyncHandler } = require("../helper/async-error.helper");
const { base_url, modifyResponse } = require("../helper/local.helpers");
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
    const event = await Event.findById({ _id: id })
      .populate("reviews.user", "firstName lastName profilePicture")
      .populate("createdBy", "firstName lastName profilePicture");
    // if (event) {
    //   let eventObj = event.toObject();
    //   eventObj?.reviews &&
    //     eventObj?.reviews.length > 0 &&
    //     eventObj?.reviews.forEach((review) => {
    //       if (
    //         review.user &&
    //         review.user.profilePicture &&
    //         !review.user.profilePicture.startsWith(base_url)
    //       ) {
    //         review.user.profilePicture = `${base_url}public/data/profile/${review.user._id}/${review.user.profilePicture}`;
    //       }
    //     });

    //   if (eventObj.images && eventObj.images.length > 0) {
    //     eventObj.images = eventObj.images.map((img) => {
    //       return `${base_url}public/data/event-image/${eventObj._id}/${img}`;
    //     });
    //   }
    //   return eventObj;
    // } else {
    //   return false;
    // }
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
      .exec();
    return events.length > 0 ? modifyResponse(events, "event-image") : false;
    // if (events.length > 0) {
    //   const modifiedEvents = events.map((event) => {
    //     let eventObj = event.toObject();

    //     eventObj?.reviews &&
    //       eventObj?.reviews.length > 0 &&
    //       eventObj?.reviews.forEach((review) => {
    //         if (
    //           review.user &&
    //           review.user.profilePicture &&
    //           !review.user.profilePicture.startsWith(base_url)
    //         ) {
    //           review.user.profilePicture = `${base_url}public/data/profile/${review.user._id}/${review.user.profilePicture}`;
    //         }
    //       });

    //     if (eventObj.images && eventObj.images.length > 0) {
    //       eventObj.images = eventObj.images.map((img) => {
    //         return `${base_url}public/data/event-image/${eventObj._id}/${img}`;
    //       });
    //     }
    //     return eventObj;
    //   });
    //   return modifiedEvents;
    // } else {
    //   return false;
    // }
  });
};

const findEventByIdHelper = async (id) => {
  return asyncHandler(async () => {
    const event = await Event.findById(id);
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
