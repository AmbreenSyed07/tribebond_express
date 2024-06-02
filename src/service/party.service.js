/** @format */

const { asyncHandler } = require("../helper/async-error.helper");
const { base_url, modifyResponse } = require("../helper/local.helpers");
const Party = require("../model/party.model");

const createParty = async (info) => {
  return asyncHandler(async () => {
    const party = new Party(info);
    const savedParty = await party.save();
    return savedParty instanceof Party ? savedParty.toJSON() : false;
  });
};

const findAndUpdateParty = async (findInfo, setInfo) => {
  return asyncHandler(async () => {
    const party = await Party.findOneAndUpdate(
      findInfo,
      { $set: setInfo },
      { new: true, runValidators: true }
    );
    return party ? party : false;
  });
};

const findPartyById = async (id) => {
  return asyncHandler(async () => {
    const party = await Party.findById({ _id: id })
      .populate("reviews.user", "firstName lastName profilePicture")
      .populate("createdBy", "firstName lastName profilePicture")
      .exec();
    if (party) {
      let partyObj = party.toObject();

      if (
        partyObj.createdBy &&
        partyObj.createdBy.profilePicture &&
        !partyObj.createdBy.profilePicture.startsWith(base_url)
      ) {
        partyObj.createdBy.profilePicture = `${base_url}public/data/profile/${partyObj.createdBy._id}/${partyObj.createdBy.profilePicture}`;
      }
      partyObj?.reviews &&
        partyObj?.reviews.length > 0 &&
        partyObj?.reviews.forEach((review) => {
          if (
            review.user &&
            review.user.profilePicture &&
            !review.user.profilePicture.startsWith(base_url)
          ) {
            review.user.profilePicture = `${base_url}public/data/profile/${review.user._id}/${review.user.profilePicture}`;
          }
        });

      if (partyObj.images && partyObj.images.length > 0) {
        partyObj.images = partyObj.images.map((img) => {
          return `${base_url}public/data/party/${partyObj._id}/${img}`;
        });
      }
      return partyObj;
    } else {
      return false;
    }
  });
};

const findPartiesByCity = async (city) => {
  return asyncHandler(async () => {
    const parties = await Party.find({
      city: { $regex: `^${city}$`, $options: "i" },
      status: true,
    })
      .collation({ locale: "en", strength: 2 })
      .populate("reviews.user", "firstName lastName profilePicture")
      .populate("createdBy", "firstName lastName profilePicture")
      .exec();

    if (parties.length > 0) {
      const modifiedParties = parties.map((party) => {
        let partyObj = party.toObject();

        if (
          partyObj.createdBy &&
          partyObj.createdBy.profilePicture &&
          !partyObj.createdBy.profilePicture.startsWith(base_url)
        ) {
          partyObj.createdBy.profilePicture = `${base_url}public/data/profile/${partyObj.createdBy._id}/${partyObj.createdBy.profilePicture}`;
        }

        partyObj?.reviews &&
          partyObj?.reviews.length > 0 &&
          partyObj?.reviews.forEach((review) => {
            if (
              review.user &&
              review.user.profilePicture &&
              !review.user.profilePicture.startsWith(base_url)
            ) {
              review.user.profilePicture = `${base_url}public/data/profile/${review.user._id}/${review.user.profilePicture}`;
            }
          });

        if (partyObj.images && partyObj.images.length > 0) {
          partyObj.images = partyObj.images.map((img) => {
            return `${base_url}public/data/party/${partyObj._id}/${img}`;
          });
        }
        return partyObj;
      });
      return modifiedParties;
    } else {
      return false;
    }
  });
};

const findPartyByIdHelper = async (id) => {
  return asyncHandler(async () => {
    const party = await Party.findOne({ _id: id, status: true });
    return party ? party : false;
  });
};

const searchParties = async (query) => {
  return asyncHandler(async () => {
    const parties = await Party.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { city: { $regex: query, $options: "i" } },
      ],
    })
      .populate("reviews.user", "firstName lastName profilePicture")
      .populate("createdBy", "firstName lastName profilePicture")
      .exec();
    return parties.length > 0 ? modifyResponse(parties, "party") : false;
  });
};


module.exports = {
  createParty,
  findAndUpdateParty,
  findPartiesByCity,
  findPartyById,
  findPartyByIdHelper,
  searchParties,
};
