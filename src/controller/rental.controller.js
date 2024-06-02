/** @format */

const { asyncErrorHandler } = require("../helper/async-error.helper");
const { sendResponse } = require("../helper/local.helpers");
const { isNotEmpty } = require("../helper/validate.helpers");
const {
  createRental,
  findAndUpdateRental,
  findRentalByIdHelper,
  findRentalById,
  findRentalsByCity,
  searchRentals,
} = require("../service/rental.service");
const {
  extractImageIdentifier,
  deleteImageFromStorage,
  uploadAndCreateImage,
} = require("../helper/upload.helpers");

const addRental = async (req, res) => {
  return asyncErrorHandler(async () => {
    const { _id: userId } = req.tokenData;
    const { name, description, address, city, phone, website } = req.body;
    let rental_images = req && req.files && req.files.images;

    if (!isNotEmpty(name)) {
      return sendResponse(res, 400, false, "Please enter the name.");
    } else if (!isNotEmpty(address)) {
      return sendResponse(res, 400, false, "Please enter an address.");
    } else if (!isNotEmpty(city)) {
      return sendResponse(res, 400, false, "Please enter the city.");
    } else if (!isNotEmpty(phone)) {
      return sendResponse(res, 400, false, "Please enter a contact number.");
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

    const newRental = await createRental(info);
    if (!newRental) {
      return sendResponse(res, 400, false, "Unable to add new rental.");
    } else {
      if (rental_images) {
        let imgArray = [];
        if (!rental_images[0]) {
          let fileName = await uploadAndCreateImage(
            rental_images,
            "rental",
            newRental._id,
            res
          );
          imgArray.push(fileName);
        } else {
          for (let img of rental_images) {
            let fileName = await uploadAndCreateImage(
              img,
              "rental",
              newRental._id,
              res
            );
            imgArray.push(fileName);
          }
        }
        let updatedRental = await findAndUpdateRental(
          { _id: newRental._id },
          {
            images: imgArray,
          }
        );
        if (!updatedRental) {
          return sendResponse(res, 400, false, "Unable to save images.");
        }
      }

      return sendResponse(
        res,
        200,
        true,
        "Successfully added new rental.",
        newRental
      );
    }
  }, res);
};

const editRental = async (req, res) => {
  return asyncErrorHandler(async () => {
    const { id: rentalId } = req.params;
    const { _id: userId } = req.tokenData;
    const { name, description, address, city, phone, website } = req.body;

    const rentalRecord = await findRentalByIdHelper(rentalId);
    if (!rentalRecord) {
      return sendResponse(res, 404, false, "Rental record not found");
    }

    if (rentalRecord.createdBy.toString() !== userId.toString()) {
      return sendResponse(
        res,
        403,
        false,
        "You are not authorized to edit this rental record."
      );
    }

    if (req.files) {
      const { images } = req.files;
      await editImage(rentalId, images, res);
    }

    const findInfo = { _id: rentalId, status: true };
    const setInfo = {
      name,
      description,
      address,
      city,
      phone,
      website,
      updatedBy: userId,
    };

    const rental = await findAndUpdateRental(findInfo, setInfo);
    if (!rental) {
      return sendResponse(res, 400, false, "Unable to update rental info.");
    } else {
      return sendResponse(
        res,
        200,
        true,
        "Successfully updated rental info.",
        rental
      );
    }
  }, res);
};

const editImage = async (rentalId, images, res) => {
  const rental = await findRentalByIdHelper(rentalId);
  if (!rental) {
    return sendResponse(res, 400, false, "Rental not found.");
  }

  // Assuming images is an array of files
  const imagePaths = [];
  if (!images[0]) {
    let fileName = await uploadAndCreateImage(images, "rental", rentalId, res);
    imagePaths.push(fileName);
  } else {
    for (let file of images) {
      let fileName = await uploadAndCreateImage(file, "rental", rentalId, res);
      imagePaths.push(fileName);
    }
  }

  rental.images = [...rental.images, ...imagePaths];
  await rental.save();
};

const getRentals = async (req, res) => {
  return asyncErrorHandler(async () => {
    const { city } = req.tokenData;
    const { query } = req.query;

    let rentals;
    if (query) {
      rentals = await searchRentals(query);
    } else {
      rentals = await findRentalsByCity(city);
    }
    if (!rentals) {
      return sendResponse(res, 400, false, "No rentals found.");
    }

    return sendResponse(
      res,
      200,
      true,
      "Successfully fetched rentals.",
      rentals
    );
  }, res);
};

const getRentalById = async (req, res) => {
  return asyncErrorHandler(async () => {
    let { id } = req.params;
    const rental = await findRentalById(id);
    if (!rental) {
      return sendResponse(res, 400, false, "Rental not found.");
    }
    return sendResponse(res, 200, true, "Successfully fetched rental.", rental);
  }, res);
};

const deleteRentalImages = async (req, res) => {
  return asyncErrorHandler(async () => {
    const { rentalId, imageUrls } = req.body;
    const { _id: userId } = req.tokenData;
    const rental = await findRentalByIdHelper(rentalId);
    if (!rental) {
      return sendResponse(res, 404, false, "Rental not found");
    }
    if (rental.createdBy.toString() !== userId.toString()) {
      return sendResponse(
        res,
        403,
        false,
        "You are not authorized to edit this rental record."
      );
    }

    const deleteImagePromises = imageUrls.map(async (imageUrl) => {
      const imageIdentifier = extractImageIdentifier(imageUrl);
      const deletedImage = await deleteImageFromStorage(
        imageIdentifier,
        rentalId,
        "rental"
      );
      rental.images = rental.images.filter((img) => img !== imageIdentifier);
    });
    await Promise.all(deleteImagePromises);
    let updatedRental = await findAndUpdateRental({ _id: rentalId }, rental);
    if (!updatedRental) {
      return sendResponse(res, 404, false, "Unable to save changes.");
    }
    return sendResponse(res, 200, true, "Deleted successfully.");
  }, res);
};

const addRentalReview = async (req, res) => {
  return asyncErrorHandler(async () => {
    const { _id: userId } = req.tokenData;
    const { rentalId, review } = req.body;
    if (!isNotEmpty(review)) {
      return sendResponse(res, 400, false, "Please write a review.");
    }
    const rental = await findRentalByIdHelper(rentalId);
    if (!rental) {
      return sendResponse(res, 404, false, "Rental not found.");
    }
    const newReview = { user: userId, reviewText: review };
    rental.reviews.unshift(newReview);
    await rental.save();
    return sendResponse(res, 200, true, "Successfully added your review.");
  }, res);
};

const searchRental = async (req, res) => {
  return asyncErrorHandler(async () => {
    const { query } = req.body;

    if (!query) {
      return sendResponse(res, 400, false, "Query parameter is required.");
    }

    const rentals = await searchRentals(query);
    if (!rentals || rentals.length === 0) {
      return sendResponse(res, 404, false, "No rentals found.");
    }

    return sendResponse(
      res,
      200,
      true,
      "Successfully fetched rentals.",
      rentals
    );
  }, res);
};

module.exports = {
  addRental,
  editRental,
  getRentals,
  getRentalById,
  deleteRentalImages,
  addRentalReview,
  searchRental,
};
