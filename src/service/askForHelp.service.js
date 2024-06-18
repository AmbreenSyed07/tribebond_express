/** @format */

const { asyncHandler } = require("../helper/async-error.helper");
const { base_url } = require("../helper/local.helpers");
const HelpRequest = require("../model/askForHelp.model");

const createHelpRequest = async (info) => {
  return asyncHandler(async () => {
    const helpRequest = new HelpRequest(info);

    const savedHelpRequest = await helpRequest.save();
    return savedHelpRequest instanceof HelpRequest
      ? savedHelpRequest.toJSON()
      : false;
  });
};

const findAndUpdateHelpRequest = async (findInfo, setInfo) => {
  return asyncHandler(async () => {
    const helpRequest = await HelpRequest.findOneAndUpdate(
      findInfo, // Match both ID and Type
      {
        $set: setInfo,
      },
      { new: true, runValidators: true } // Options to return the updated document and run schema validators
    );
    return helpRequest ? helpRequest : false;
  });
};

const findHelpRequestById = async (id) => {
  return asyncHandler(async () => {
    const helpRequest = await HelpRequest.findOne({
      _id: id,
      status: true,
    })
      .populate("createdBy", "firstName lastName profilePicture")
      .populate("reviews.user", "firstName lastName profilePicture");
    if (helpRequest) {
      let helpRequestObj = helpRequest.toObject();

      if (
        helpRequestObj.createdBy &&
        helpRequestObj.createdBy.profilePicture &&
        !helpRequestObj.createdBy.profilePicture.startsWith(base_url)
      ) {
        helpRequestObj.createdBy.profilePicture = `${base_url}public/data/profile/${helpRequestObj.createdBy._id}/${helpRequestObj.createdBy.profilePicture}`;
      }

      helpRequestObj?.reviews &&
        helpRequestObj?.reviews.length > 0 &&
        helpRequestObj?.reviews.forEach((review) => {
          if (
            review.user &&
            review.user.profilePicture &&
            !review.user.profilePicture.startsWith(base_url)
          ) {
            review.user.profilePicture = `${base_url}public/data/profile/${review.user._id}/${review.user.profilePicture}`;
          }
        });

      if (helpRequestObj.images && helpRequestObj.images.length > 0) {
        helpRequestObj.images = helpRequestObj.images.map((img) => {
          return `${base_url}public/data/helpRequest/images/${helpRequestObj._id}/${img}`;
        });
      }
      return helpRequestObj;
    } else {
      return false;
    }
  });
};

const findHelpRequestsByCity = async (city) => {
  return asyncHandler(async () => {
    const helpRequests = await HelpRequest.find({
      city: { $regex: `^${city}$`, $options: "i" },
      status: true,
    })
      .collation({ locale: "en", strength: 2 })
      .populate("createdBy", "firstName lastName profilePicture")
      .populate("reviews.user", "firstName lastName profilePicture")
      .exec();
    if (helpRequests.length > 0) {
      const modifiedHelpRequests = helpRequests.map((helpRequest) => {
        let helpRequestObj = helpRequest.toObject();

        if (
          helpRequestObj.createdBy &&
          helpRequestObj.createdBy.profilePicture &&
          !helpRequestObj.createdBy.profilePicture.startsWith(base_url)
        ) {
          helpRequestObj.createdBy.profilePicture = `${base_url}public/data/profile/${helpRequestObj.createdBy._id}/${helpRequestObj.createdBy.profilePicture}`;
        }

        helpRequestObj?.reviews &&
          helpRequestObj?.reviews.length > 0 &&
          helpRequestObj?.reviews.forEach((review) => {
            if (
              review.user &&
              review.user.profilePicture &&
              !review.user.profilePicture.startsWith(base_url)
            ) {
              review.user.profilePicture = `${base_url}public/data/profile/${review.user._id}/${review.user.profilePicture}`;
            }
          });

        if (helpRequestObj.images && helpRequestObj.images.length > 0) {
          helpRequestObj.images = helpRequestObj.images.map((img) => {
            return `${base_url}public/data/helpRequest/images/${helpRequestObj._id}/${img}`;
          });
        }
        return helpRequestObj;
      });
      return modifiedHelpRequests;
    } else {
      return false;
    }
  });
};

const findHelpRequestByIdHelper = async (id) => {
  return asyncHandler(async () => {
    const helpRequest = await HelpRequest.findOne({ _id: id, status: true });
    return helpRequest ? helpRequest : false;
  });
};

const searchHelpRequests = async (query) => {
  return asyncHandler(async () => {
    const helpRequests = await HelpRequest.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { city: { $regex: query, $options: "i" } },
        { category: { $regex: query, $options: "i" } },
      ],
      status: true,
    });
    return helpRequests.length > 0 ? helpRequests : false;
  });
};

module.exports = {
  createHelpRequest,
  findAndUpdateHelpRequest,
  findHelpRequestsByCity,
  findHelpRequestById,
  findHelpRequestByIdHelper,
  searchHelpRequests,
};
