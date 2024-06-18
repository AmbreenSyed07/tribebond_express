/** @format */

const { asyncHandler } = require("../helper/async-error.helper");
const { base_url } = require("../helper/local.helpers");
const VolunteerEvent = require("../model/volunteerEvent.model");

const createVolunteerEvent = async (info) => {
  return asyncHandler(async () => {
    const volunteerEvent = new VolunteerEvent(info);

    const savedVolunteerEvent = await volunteerEvent.save();
    return savedVolunteerEvent instanceof VolunteerEvent
      ? savedVolunteerEvent.toJSON()
      : false;
  });
};

const findAndUpdateVolunteerEvent = async (findInfo, setInfo) => {
  return asyncHandler(async () => {
    const volunteerEvent = await VolunteerEvent.findOneAndUpdate(
      findInfo, // Match both ID and Type
      {
        $set: setInfo,
      },
      { new: true, runValidators: true } // Options to return the updated document and run schema validators
    );
    return volunteerEvent ? volunteerEvent : false;
  });
};

const findVolunteerEventById = async (id) => {
  return asyncHandler(async () => {
    const volunteerEvent = await VolunteerEvent.findOne({
      _id: id,
      status: true,
    })
      .populate("createdBy", "firstName lastName profilePicture")
      .populate("reviews.user", "firstName lastName profilePicture");
    if (volunteerEvent) {
      let volunteerEventObj = volunteerEvent.toObject();

      if (
        volunteerEventObj.createdBy &&
        volunteerEventObj.createdBy.profilePicture &&
        !volunteerEventObj.createdBy.profilePicture.startsWith(base_url)
      ) {
        volunteerEventObj.createdBy.profilePicture = `${base_url}public/data/profile/${volunteerEventObj.createdBy._id}/${volunteerEventObj.createdBy.profilePicture}`;
      }

      volunteerEventObj?.reviews &&
        volunteerEventObj?.reviews.length > 0 &&
        volunteerEventObj?.reviews.forEach((review) => {
          if (
            review.user &&
            review.user.profilePicture &&
            !review.user.profilePicture.startsWith(base_url)
          ) {
            review.user.profilePicture = `${base_url}public/data/profile/${review.user._id}/${review.user.profilePicture}`;
          }
        });

      if (volunteerEventObj.images && volunteerEventObj.images.length > 0) {
        volunteerEventObj.images = volunteerEventObj.images.map((img) => {
          return `${base_url}public/data/volunteer/images/${volunteerEventObj._id}/${img}`;
        });
      }
      return volunteerEventObj;
    } else {
      return false;
    }
  });
};

const findVolunteerEventsByCity = async (city) => {
  return asyncHandler(async () => {
    const volunteerEvents = await VolunteerEvent.find({
      city: { $regex: `^${city}$`, $options: "i" },
      status: true,
    })
      .collation({ locale: "en", strength: 2 })
      .populate("createdBy", "firstName lastName profilePicture")
      .populate("reviews.user", "firstName lastName profilePicture")
      .exec();
    if (volunteerEvents.length > 0) {
      const modifiedVolunteerEvents = volunteerEvents.map((volunteerEvent) => {
        let volunteerEventObj = volunteerEvent.toObject();

        if (
          volunteerEventObj.createdBy &&
          volunteerEventObj.createdBy.profilePicture &&
          !volunteerEventObj.createdBy.profilePicture.startsWith(base_url)
        ) {
          volunteerEventObj.createdBy.profilePicture = `${base_url}public/data/profile/${volunteerEventObj.createdBy._id}/${volunteerEventObj.createdBy.profilePicture}`;
        }

        volunteerEventObj?.reviews &&
          volunteerEventObj?.reviews.length > 0 &&
          volunteerEventObj?.reviews.forEach((review) => {
            if (
              review.user &&
              review.user.profilePicture &&
              !review.user.profilePicture.startsWith(base_url)
            ) {
              review.user.profilePicture = `${base_url}public/data/profile/${review.user._id}/${review.user.profilePicture}`;
            }
          });

        if (volunteerEventObj.images && volunteerEventObj.images.length > 0) {
          volunteerEventObj.images = volunteerEventObj.images.map((img) => {
            return `${base_url}public/data/volunteer/images/${volunteerEventObj._id}/${img}`;
          });
        }
        return volunteerEventObj;
      });
      return modifiedVolunteerEvents;
    } else {
      return false;
    }
  });
};

const findVolunteerEventByIdHelper = async (id) => {
  return asyncHandler(async () => {
    const volunteerEvent = await VolunteerEvent.findOne({
      _id: id,
      status: true,
    });
    return volunteerEvent ? volunteerEvent : false;
  });
};

const searchVolunteerEvents = async (query) => {
  return asyncHandler(async () => {
    const volunteerEvents = await VolunteerEvent.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { city: { $regex: query, $options: "i" } },
      ],
      status: true,
    });
    return volunteerEvents.length > 0 ? volunteerEvents : false;
  });
};

module.exports = {
  createVolunteerEvent,
  findAndUpdateVolunteerEvent,
  findVolunteerEventsByCity,
  findVolunteerEventById,
  findVolunteerEventByIdHelper,
  searchVolunteerEvents,
};
