/** @format */

const { asyncErrorHandler } = require("../helper/async-error.helper");
const { sendResponse } = require("../helper/local.helpers");
const {
  isNotEmpty,
  isPhoneNo,
  isWebsite,
} = require("../helper/validate.helpers");
const {
  createParty,
  findAndUpdateParty,
  findPartyByIdHelper,
  findPartyById,
  findPartiesByCity,
  searchParties,
} = require("../service/party.service");
const {
  extractImageIdentifier,
  deleteImageFromStorage,
  uploadAndCreateImage,
} = require("../helper/upload.helpers");

const addParty = async (req, res) => {
  return asyncErrorHandler(async () => {
    const { _id: userId } = req.tokenData;
    const { name, description, address, city, phone, website } = req.body;
    let party_images = req && req.files && req.files.images;

    if (!isNotEmpty(name)) {
      return sendResponse(res, 400, false, "Please enter the name.");
    } else if (!isNotEmpty(address)) {
      return sendResponse(res, 400, false, "Please enter an  address.");
    } else if (!isNotEmpty(city)) {
      return sendResponse(res, 400, false, "Please enter the city.");
    } else if (!isNotEmpty(phone) || !isPhoneNo(phone)) {
      return sendResponse(
        res,
        400,
        false,
        "Please enter a valid contact number."
      );
    } else if (!isWebsite(website)) {
      return sendResponse(res, 400, false, "Please enter a valid website url.");
    } else if (!party_images || party_images.length <= 0) {
      return sendResponse(res, 400, false, "Please select images.");
    }

    const info = {
      name,
      description,
      address,
      city,
      phone,
      website,
      createdBy: userId,
    };

    const newParty = await createParty(info);
    if (!newParty) {
      return sendResponse(res, 400, false, "Unable to add new party.");
    } else {
      if (party_images) {
        let imgArray = [];
        if (!party_images[0]) {
          let fileName = await uploadAndCreateImage(
            party_images,
            "party",
            newParty._id,
            res
          );
          imgArray.push(fileName);
        } else {
          for (let img of party_images) {
            let fileName = await uploadAndCreateImage(
              img,
              "party",
              newParty._id,
              res
            );
            imgArray.push(fileName);
          }
        }
        let updatedParty = await findAndUpdateParty(
          { _id: newParty._id },
          { images: imgArray }
        );
        if (!updatedParty) {
          return sendResponse(res, 400, false, "Unable to save images.");
        }
      }
      return sendResponse(
        res,
        200,
        true,
        "Successfully added new party.",
        newParty
      );
    }
  }, res);
};

const editParty = async (req, res) => {
  return asyncErrorHandler(async () => {
    const { id: partyId } = req.params;
    const { _id: userId } = req.tokenData;
    const { name, description, address, city, phone, website } = req.body;

    const checkParty = await findPartyByIdHelper(partyId);
    if (!checkParty) {
      return sendResponse(res, 404, false, "Party not found.");
    }
    // Check if the party's createdBy is equal to the user's id
    if (checkParty.createdBy.toString() !== userId.toString()) {
      return sendResponse(
        res,
        403,
        false,
        "You are not authorized to edit this party."
      );
    }

    if (!isNotEmpty(name)) {
      return sendResponse(res, 400, false, "Please enter the name.");
    } else if (!isNotEmpty(address)) {
      return sendResponse(res, 400, false, "Please enter an  address.");
    } else if (!isNotEmpty(city)) {
      return sendResponse(res, 400, false, "Please enter the city.");
    } else if (!isNotEmpty(phone) || !isPhoneNo(phone)) {
      return sendResponse(
        res,
        400,
        false,
        "Please enter a valid contact number."
      );
    } else if (!isWebsite(website)) {
      return sendResponse(res, 400, false, "Please enter a valid website url.");
    }

    if (req.files) {
      const { images } = req.files;
      await editImage(partyId, images, res);
    }

    const findInfo = { _id: partyId, status: true };
    const setInfo = {
      name,
      description,
      address,
      city,
      phone,
      website,
      updatedBy: userId,
    };

    const party = await findAndUpdateParty(findInfo, setInfo);
    if (!party) {
      return sendResponse(res, 400, false, "Unable to update party info.");
    } else {
      return sendResponse(
        res,
        200,
        true,
        "Successfully updated party info.",
        party
      );
    }
  }, res);
};

const editImage = async (partyId, images, res) => {
  const party = await findPartyByIdHelper(partyId);
  if (!party) {
    return sendResponse(res, 400, false, "Party not found.");
  }

  const imagePaths = [];
  if (!images[0]) {
    let fileName = await uploadAndCreateImage(images, "party", partyId, res);
    imagePaths.push(fileName);
  } else {
    for (let file of images) {
      let fileName = await uploadAndCreateImage(file, "party", partyId, res);
      imagePaths.push(fileName);
    }
  }

  party.images = [...party.images, ...imagePaths];
  await party.save();
};

const getParties = async (req, res) => {
  return asyncErrorHandler(async () => {
    const { city } = req.tokenData;

    const { query } = req.query;

    let parties;
    if (query) {
      parties = await searchParties(query);
    } else {
      parties = await findPartiesByCity(city);
    }

    if (!parties) {
      return sendResponse(res, 400, false, "No parties found.");
    }

    return sendResponse(
      res,
      200,
      true,
      "Successfully fetched parties.",
      parties
    );
  }, res);
};

const getPartyById = async (req, res) => {
  return asyncErrorHandler(async () => {
    const { id } = req.params;
    const party = await findPartyById(id);
    if (!party) {
      return sendResponse(res, 400, false, "Party not found.");
    }
    return sendResponse(res, 200, true, "Successfully fetched party.", party);
  }, res);
};

const deletePartyImages = async (req, res) => {
  return asyncErrorHandler(async () => {
    const { partyId, imageUrls } = req.body;
    const { _id: userId } = req.tokenData;

    if (!partyId) {
      return sendResponse(res, 400, false, "Please select a record id.");
    }

    const party = await findPartyByIdHelper(partyId);
    if (!party) {
      return sendResponse(res, 404, false, "Record not found.");
    }
    if (party.createdBy.toString() !== userId.toString()) {
      return sendResponse(
        res,
        403,
        false,
        "You are not authorized to edit this record."
      );
    } else if (!imageUrls || imageUrls.length <= 0) {
      return sendResponse(res, 400, false, "Please select images to delete.");
    }

    const deleteImagePromises = imageUrls.map(async (imageUrl) => {
      const imageIdentifier = extractImageIdentifier(imageUrl);
      await deleteImageFromStorage(imageIdentifier, partyId, "party");
      party.images = party.images.filter((img) => img !== imageIdentifier);
    });
    await Promise.all(deleteImagePromises);
    let updatedParty = await findAndUpdateParty({ _id: partyId }, party);
    if (!updatedParty) {
      return sendResponse(res, 404, false, "Unable to save changes.");
    }
    return sendResponse(res, 200, true, "Deleted successfully.");
  }, res);
};

const addPartyReview = async (req, res) => {
  return asyncErrorHandler(async () => {
    const { _id: userId } = req.tokenData;
    const { partyId, review } = req.body;

    if (!partyId) {
      return sendResponse(res, 400, false, "Please select a record id.");
    }
    if (!isNotEmpty(review)) {
      return sendResponse(res, 400, false, "Please write a review.");
    }
    const party = await findPartyByIdHelper(partyId);
    if (!party) {
      return sendResponse(res, 404, false, "Party not found.");
    }
    const newReview = { user: userId, reviewText: review };
    party.reviews.unshift(newReview);
    await party.save();
    return sendResponse(res, 200, true, "Successfully added your review.");
  }, res);
};

const searchParty = async (req, res) => {
  return asyncErrorHandler(async () => {
    const { query } = req.body;

    if (!query) {
      return sendResponse(res, 400, false, "Query parameter is required.");
    }

    const parties = await searchParties(query);
    if (!parties || parties.length === 0) {
      return sendResponse(res, 404, false, "No parties found.");
    }

    return sendResponse(
      res,
      200,
      true,
      "Successfully fetched parties.",
      parties
    );
  }, res);
};

const deleteParty = async (req, res) => {
  return asyncErrorHandler(async () => {
    const { id } = req.params;
    const { _id: userId } = req.tokenData;

    const party = await findPartyByIdHelper(id);
    if (!party) {
      return sendResponse(res, 404, false, "Record not found");
    }
    if (party.createdBy.toString() !== userId.toString()) {
      return sendResponse(
        res,
        403,
        false,
        "You are not authorized to delete this record."
      );
    }

    const deleteParty = await findAndUpdateParty(
      { _id: id },
      {
        status: false,
        updatedBy: userId,
      }
    );
    if (!deleteParty) {
      return sendResponse(
        res,
        403,
        false,
        "Some error occurred, please try again later."
      );
    }

    return sendResponse(res, 200, true, "Successfully deleted record.");
  }, res);
};

module.exports = {
  addParty,
  editParty,
  getParties,
  getPartyById,
  deletePartyImages,
  addPartyReview,
  searchParty,
  deleteParty,
};
