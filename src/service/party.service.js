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
    const party = await Party.findOne({ _id: id, status: true })
      .populate("reviews.user", "firstName lastName profilePicture")
      .populate("createdBy", "firstName lastName profilePicture")
      .exec();
    if (party) {
      return modifyResponse([party], "party");
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
      .sort({ createdAt: -1 })
      .exec();

    if (parties.length > 0) {
      return modifyResponse(parties, "party");
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
      status: true,
    })
      .populate("reviews.user", "firstName lastName profilePicture")
      .populate("createdBy", "firstName lastName profilePicture")
      .sort({ createdAt: -1 })
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
