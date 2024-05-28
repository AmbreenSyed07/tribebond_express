const {
  asyncErrorHandler,
  asyncHandler,
} = require("../helper/async-error.helper");
const { sendResponse } = require("../helper/local.helpers");
const { isNotEmpty } = require("../helper/validate.helpers");
const {
  createMeat,
  findAndUpdateMeat,
  findMeatByIdHelper,
  findMeatById,
  findRestaurantsByCity,
  findMeatsByCity,
} = require("../service/halalMeat.service");
const {
  extractImageIdentifier,
  deleteImageFromStorage,
  uploadAndCreateImage,
} = require("../helper/upload.helpers");

const addMeat = async (req, res) => {
  return asyncErrorHandler(async () => {
    const { _id: userId } = req.tokenData;
    const { name, description, address, city, phone, website } = req.body;
    let meat_thumbnail = req && req.files && req.files.thumbnail;
    let meat_images = req && req.files && req.files.images;

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

    const newMeat = await createMeat(info);
    if (!newMeat) {
      return sendResponse(
        res,
        400,
        false,
        "Unable to add new halal meat shop."
      );
    } else {
      let thumbnail;
      if (meat_thumbnail) {
        const newFile = await uploadAndCreateImage(
          meat_thumbnail,
          "halal-meat/thumbnail",
          newMeat._id,
          res
        );
        thumbnail = newFile;
      }

      if (thumbnail) {
        let updatedMeat = await findAndUpdateMeat(
          { _id: newMeat._id },
          {
            thumbnail: thumbnail,
          }
        );
        if (!updatedMeat) {
          return sendResponse(res, 400, false, "Unable to save thumbnail.");
        }
      }
      if (meat_images) {
        let imgArray = [];
        if (!meat_images[0]) {
          let fileName = await uploadAndCreateImage(
            meat_images,
            "halal-meat/images",
            newMeat._id,
            res
          );
          imgArray.push(fileName);
        } else {
          for (let img of meat_images) {
            let fileName = await uploadAndCreateImage(
              img,
              "halal-meat/images",
              newMeat._id,
              res
            );
            imgArray.push(fileName);
          }
        }
        let updatedMeat = await findAndUpdateMeat(
          { _id: newMeat._id },
          {
            images: imgArray,
          }
        );
        if (!updatedMeat) {
          return sendResponse(res, 400, false, "Unable to save images.");
        }
      }

      return sendResponse(
        res,
        200,
        true,
        "Successfully added halal meat shop.",
        newMeat
      );
    }
  }, res);
};

const editMeat = async (req, res) => {
  return asyncErrorHandler(async () => {
    const { id: meatId } = req.params;
    const { _id: userId } = req.tokenData;
    const { name, description, address, city, phone, website } = req.body;

    if (req.files) {
      const { images } = req.files;
      await editImage(meatId, images, res);
    }

    const findInfo = { _id: meatId, status: true };
    const setInfo = {
      name,
      description,
      address,
      city,
      phone,
      website,
      updatedBy: userId,
    };

    const meat = await findAndUpdateMeat(findInfo, setInfo);
    if (!meat) {
      return sendResponse(res, 400, false, "Unable to update meat info.");
    } else {
      return sendResponse(
        res,
        200,
        true,
        "Successfully updated meat info.",
        meat
      );
    }
  }, res);
};

const editImage = async (meatId, images, res) => {
  const meat = await findMeatByIdHelper(meatId);
  if (!meat) {
    return sendResponse(res, 400, false, "Meat not found.");
  }

  // Assuming images is an array of files
  const imagePaths = [];
  if (!images[0]) {
    let fileName = await uploadAndCreateImage(
      images,
      "halal-meat/images",
      meatId,
      res
    );
    imagePaths.push(fileName);
  } else {
    for (let file of images) {
      let fileName = await uploadAndCreateImage(
        file,
        "halal-meat/images",
        meatId,
        res
      );
      imagePaths.push(fileName);
    }
  }

  meat.images = [...meat.images, ...imagePaths];
  await meat.save();
};

const getMeats = async (req, res) => {
  return asyncErrorHandler(async () => {
    const { city } = req.tokenData;
    const meats = await findMeatsByCity(city);
    if (!meats) {
      return sendResponse(res, 400, false, "No meats found.");
    }

    return sendResponse(
      res,
      200,
      true,
      "Successfully fetched halal meat shops.",
      meats
    );
  }, res);
};

const getMeatById = async (req, res) => {
  return asyncErrorHandler(async () => {
    let { id } = req.params;
    const meat = await findMeatById(id);
    if (!meat) {
      return sendResponse(res, 400, false, "Meat not found.");
    }
    return sendResponse(
      res,
      200,
      true,
      "Successfully fetched halal meat shop.",
      meat
    );
  }, res);
};

const deleteImages = async (req, res) => {
  return asyncErrorHandler(async () => {
    const { meatId, imageUrls } = req.body;
    const meat = await findMeatByIdHelper(meatId);
    if (!meat) {
      return sendResponse(res, 404, false, "Meat not found");
    }

    const deleteImagePromises = imageUrls.map(async (imageUrl) => {
      const imageIdentifier = extractImageIdentifier(imageUrl);
      const deletedImage = await deleteImageFromStorage(
        imageIdentifier,
        meatId,
        "halal-meat/images"
      );
      meat.images = meat.images.filter((img) => img !== imageIdentifier);
    });
    await Promise.all(deleteImagePromises);
    let updatedMeat = await findAndUpdateMeat({ _id: meatId }, meat); //will update the existing event, as event is an instance of existing one
    if (!updatedMeat) {
      return sendResponse(res, 404, false, "Unable to save changes.");
    }
    return sendResponse(res, 200, true, "Deleted successfully.");
  }, res);
};

const addReview = async (req, res) => {
  return asyncErrorHandler(async () => {
    const { _id: userId } = req.tokenData;
    const { meatId, review } = req.body;
    if (!isNotEmpty(review)) {
      return sendResponse(res, 400, false, "Please write a review.");
    }
    const meat = await findMeatByIdHelper(meatId);
    if (!meat) {
      return sendResponse(res, 404, false, "Meat not found.");
    }
    const newReview = { user: userId, reviewText: review };
    meat.reviews.unshift(newReview);
    await meat.save();
    return sendResponse(res, 200, true, "Successfully added your review.");
  }, res);
};

module.exports = {
  addMeat,
  editMeat,
  getMeats,
  getMeatById,
  deleteImages,
  addReview,
};
