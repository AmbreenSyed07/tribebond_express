const {
  asyncErrorHandler,
  asyncHandler,
} = require("../helper/async-error.helper");
const { sendResponse } = require("../helper/local.helpers");
const { isNotEmpty } = require("../helper/validate.helpers");
const {
  createGrocery,
  findAndUpdateGrocery,
  findGroceryByIdHelper,
  findGroceryById,
  findGroceriesByCity,
} = require("../service/grocery.service");
const {
  extractImageIdentifier,
  deleteImageFromStorage,
  uploadAndCreateImage,
} = require("../helper/upload.helpers");

const addGrocery = async (req, res) => {
  return asyncErrorHandler(async () => {
    const { _id: userId } = req.tokenData;
    const { name, description, address, city, phone, website } = req.body;
    let grocery_thumbnail = req && req.files && req.files.thumbnail;
    let grocery_images = req && req.files && req.files.images;

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

    const newGrocery = await createGrocery(info);
    if (!newGrocery) {
      return sendResponse(res, 400, false, "Unable to add new grocery spot.");
    } else {
      let thumbnail;
      if (grocery_thumbnail) {
        const newFile = await uploadAndCreateImage(
          grocery_thumbnail,
          "grocery/thumbnail",
          newGrocery._id,
          res
        );
        thumbnail = newFile;
      }

      if (thumbnail) {
        let updatedGrocery = await findAndUpdateGrocery(
          { _id: newGrocery._id },
          {
            thumbnail: thumbnail,
          }
        );
        if (!updatedGrocery) {
          return sendResponse(res, 400, false, "Unable to save thumbnail.");
        }
      }
      if (grocery_images) {
        let imgArray = [];
        if (!grocery_images[0]) {
          let fileName = await uploadAndCreateImage(
            grocery_images,
            "grocery/images",
            newGrocery._id,
            res
          );
          imgArray.push(fileName);
        } else {
          for (let img of grocery_images) {
            let fileName = await uploadAndCreateImage(
              img,
              "grocery/images",
              newGrocery._id,
              res
            );
            imgArray.push(fileName);
          }
        }
        let updatedGrocery = await findAndUpdateGrocery(
          { _id: newGrocery._id },
          {
            images: imgArray,
          }
        );
        if (!updatedGrocery) {
          return sendResponse(res, 400, false, "Unable to save images.");
        }
      }

      return sendResponse(
        res,
        200,
        true,
        "Successfully added new grocery spot.",
        newGrocery
      );
    }
  }, res);
};

const editGrocery = async (req, res) => {
  return asyncErrorHandler(async () => {
    const { id: groceryId } = req.params;
    const { _id: userId } = req.tokenData;
    const { name, description, address, city, phone, website } = req.body;

    if (req.files) {
      const { images } = req.files;
      await editImage(groceryId, images, res);
    }

    const findInfo = { _id: groceryId, status: true };
    const setInfo = {
      name,
      description,
      address,
      city,
      phone,
      website,
      updatedBy: userId,
    };

    const grocery = await findAndUpdateGrocery(findInfo, setInfo);
    if (!grocery) {
      return sendResponse(res, 400, false, "Unable to update grocery info.");
    } else {
      return sendResponse(
        res,
        200,
        true,
        "Successfully updated grocery info.",
        grocery
      );
    }
  }, res);
};

const editImage = async (groceryId, images, res) => {
  const grocery = await findGroceryByIdHelper(groceryId);
  if (!grocery) {
    return sendResponse(res, 400, false, "Grocery not found.");
  }

  // Assuming images is an array of files
  const imagePaths = [];
  if (!images[0]) {
    let fileName = await uploadAndCreateImage(
      images,
      "grocery/images",
      groceryId,
      res
    );
    imagePaths.push(fileName);
  } else {
    for (let file of images) {
      let fileName = await uploadAndCreateImage(
        file,
        "grocery/images",
        groceryId,
        res
      );
      imagePaths.push(fileName);
    }
  }

  grocery.images = [...grocery.images, ...imagePaths];
  await grocery.save();
};

const getGroceries = async (req, res) => {
  return asyncErrorHandler(async () => {
    const { city } = req.tokenData;
    const groceries = await findGroceriesByCity(city);
    if (!groceries) {
      return sendResponse(res, 400, false, "No groceries found.");
    }

    return sendResponse(
      res,
      200,
      true,
      "Successfully fetched grocery spots.",
      groceries
    );
  }, res);
};

const getGroceryById = async (req, res) => {
  return asyncErrorHandler(async () => {
    let { id } = req.params;
    const grocery = await findGroceryById(id);
    if (!grocery) {
      return sendResponse(res, 400, false, "Grocery not found.");
    }
    return sendResponse(
      res,
      200,
      true,
      "Successfully fetched grocery spot.",
      grocery
    );
  }, res);
};

const deleteImages = async (req, res) => {
  return asyncErrorHandler(async () => {
    const { groceryId, imageUrls } = req.body;
    const grocery = await findGroceryByIdHelper(groceryId);
    if (!grocery) {
      return sendResponse(res, 404, false, "Grocery not found");
    }

    const deleteImagePromises = imageUrls.map(async (imageUrl) => {
      const imageIdentifier = extractImageIdentifier(imageUrl);
      const deletedImage = await deleteImageFromStorage(
        imageIdentifier,
        groceryId,
        "grocery/images"
      );
      grocery.images = grocery.images.filter((img) => img !== imageIdentifier);
    });
    await Promise.all(deleteImagePromises);
    let updatedGrocery = await findAndUpdateGrocery(
      { _id: groceryId },
      grocery
    ); //will update the existing event, as event is an instance of existing one
    if (!updatedGrocery) {
      return sendResponse(res, 404, false, "Unable to save changes.");
    }
    return sendResponse(res, 200, true, "Deleted successfully.");
  }, res);
};

const addReview = async (req, res) => {
  return asyncErrorHandler(async () => {
    const { _id: userId } = req.tokenData;
    const { groceryId, review } = req.body;
    if (!isNotEmpty(review)) {
      return sendResponse(res, 400, false, "Please write a review.");
    }
    const grocery = await findGroceryByIdHelper(groceryId);
    if (!grocery) {
      return sendResponse(res, 404, false, "Grocery not found.");
    }
    const newReview = { user: userId, reviewText: review };
    grocery.reviews.unshift(newReview);
    await grocery.save();
    return sendResponse(res, 200, true, "Successfully added your review.");
  }, res);
};

module.exports = {
  addGrocery,
  editGrocery,
  getGroceries,
  getGroceryById,
  deleteImages,
  addReview,
};
