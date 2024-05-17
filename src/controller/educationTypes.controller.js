const { asyncErrorHandler } = require("../helper/async-error.helper");
const { sendResponse } = require("../helper/local.helpers");
const {
  uploadAndCreateImage,
  extractImageIdentifier,
  deleteImageFromStorage,
} = require("../helper/upload.helpers");
const {
  createEducationType,
  findEduType,
  createEduEntity,
  findAndUpdateEntity,
  getEduTypeAndEntities,
  getEduTypeAndEntitiesById,
} = require("../service/educationType.service");
const EducationalEntity = require("../model/educationalEntities.model");
const { fileUpload } = require("../helper/upload.helpers");

const addEducationTypes = async (req, res) => {
  return asyncErrorHandler(async () => {
    const { typeName, description } = req.body;

    // Validate input
    if (!typeName) {
      return sendResponse(res, 400, false, "Education type name is required.");
    }

    // Check for existing type
    const existingType = await findEduType({ typeName });
    if (existingType) {
      return sendResponse(
        res,
        409,
        false,
        "An education type with this name already exists."
      );
    }

    // Create and save the new education type
    const newType = await createEducationType({ typeName, description });
    if (!newType) {
      return sendResponse(res, 400, false, "Unable to add education type.");
    } else {
      // Success response
      return sendResponse(
        res,
        201,
        true,
        "Education type added successfully.",
        newType
      );
    }
  }, res);
};

const addEducationalEntities = async (req, res) => {
  return asyncErrorHandler(async () => {
    const { _id } = req.tokenData._doc;
    const {
      name,
      typeId,
      address,
      contactNumber,
      email,
      website,
      offers,
      additionalInfo,
    } = req.body;

    let edu_thumbnail = req && req.files && req.files.thumbnail;
    let edu_images = req && req.files && req.files.images;

    if (!typeId) {
      return sendResponse(
        res,
        400,
        false,
        "Please select an education type to add this to."
      );
    } else if (!name) {
      return sendResponse(
        res,
        400,
        false,
        "Education entity's name is required."
      );
    }

    // Check if the referenced EducationType exists
    const typeExists = await findEduType({ _id: typeId });
    if (!typeExists) {
      return sendResponse(
        res,
        400,
        false,
        "The education type you're trying to add this to doesn't exist."
      );
    }

    const info = {
      name,
      type: typeId,
      address,
      contactNumber,
      email,
      website,
      offers,
      additionalInfo,
      createdBy: _id,
    };

    // Create and save the new educational entity
    const newEntity = await createEduEntity(info);
    if (!newEntity) {
      return sendResponse(
        res,
        400,
        false,
        "Unable to add new educational entity."
      );
    } else {
      let thumbnail;
      if (edu_thumbnail) {
        const newFile = await fileUpload(
          edu_thumbnail,
          `edu-thumbnail/${newEntity._id}/`,
          ["jpg", "jpeg", "png", "gif", "webp", "avif"],
          true,
          undefined,
          undefined,
          0,
          10
        );
        if (newFile.ok === false) {
          return sendResponse(res, 400, false, newFile.message);
        }
        thumbnail = newFile.fileName;
      }

      if (thumbnail) {
        let updatedEduEntity = await findAndUpdateEntity(
          { _id: newEntity._id },
          {
            thumbnail: thumbnail,
          }
        );
        if (!updatedEduEntity) {
          return sendResponse(res, 400, false, "Unable to save thumbnail.");
        }
      }
      if (edu_images) {
        let imgArray = [];
        if (!edu_images[0]) {
          let fileName = await uploadAndCreateImage(
            edu_images,
            "edu-images",
            newEntity._id,
            res
          );
          imgArray.push(fileName);
        } else {
          for (let img of edu_images) {
            let fileName = await uploadAndCreateImage(
              img,
              "edu-images",
              newEntity._id,
              res
            );
            imgArray.push(fileName);
          }
        }
        let updatedEduEntity = await findAndUpdateEntity(
          { _id: newEntity._id },
          {
            images: imgArray,
          }
        );
        if (!updatedEduEntity) {
          return sendResponse(res, 400, false, "Unable to save images.");
        }
      }
      return sendResponse(
        res,
        200,
        true,
        "Successfully added new educational entity.",
        newEntity
      );
    }
  }, res);
};

const editEduEntities = async (req, res) => {
  return asyncErrorHandler(async () => {
    const { id } = req.params;
    const {
      name,
      typeId,
      address,
      contactNumber,
      email,
      website,
      offers,
      additionalInfo,
    } = req.body;

    if (req.files) {
      const { images } = req.files;
      await editImage(id, images, res);
    }

    const findInfo = { _id: id, type: typeId };
    const setInfo = {
      name,
      address,
      contactNumber,
      email,
      website,
      offers,
      additionalInfo,
    };

    // Check if the type provided exists and matches the entity's type
    const entity = await findAndUpdateEntity(findInfo, setInfo);
    if (!entity) {
      return sendResponse(
        res,
        400,
        false,
        "Unable to update educational entity."
      );
    }

    return sendResponse(res, 200, true, "Successfully updated entity.", entity);
  }, res);
};

const editImage = async (eduId, images, res) => {
  const eduEntity = await EducationalEntity.findById(eduId);
  if (!eduEntity) {
    return sendResponse(res, 400, false, "Educational entity not found.");
  }

  // Assuming images is an array of files
  const imagePaths = [];
  if (!images[0]) {
    let fileName = await uploadAndCreateImage(file, "edu-images", eduId, res);
    imagePaths.push(fileName);
  } else {
    for (let file of images) {
      let fileName = await uploadAndCreateImage(file, "edu-images", eduId, res);
      imagePaths.push(fileName);
    }
  }

  eduEntity.images = [...eduEntity.images, ...imagePaths];
  await eduEntity.save();
};

const deleteEduEntities = async (req, res) => {
  return asyncErrorHandler(async () => {
    const { id } = req.params;
    const { _id } = req.tokenData._doc;

    const findInfo = { _id: id };
    const setInfo = {
      status: 0,
      updatedBy: _id,
    };

    const entity = await findAndUpdateEntity(findInfo, setInfo);
    if (!entity) {
      return sendResponse(
        res,
        400,
        false,
        "Unable to delete educational entity."
      );
    }

    return sendResponse(res, 200, true, "Successfully deleted entity.");
  }, res);
};

const getEducation = async (req, res) => {
  return asyncErrorHandler(async () => {
    const education = await getEduTypeAndEntities();
    if (!education) {
      return sendResponse(
        res,
        400,
        false,
        "Unable to fetch education and trainings."
      );
    }

    return sendResponse(
      res,
      200,
      true,
      "Successfully fetched education and trainings.",
      education
    );
  }, res);
};

const getEducationById = async (req, res) => {
  return asyncErrorHandler(async () => {
    let { id } = req.params;
    const education = await getEduTypeAndEntitiesById(id);
    if (!education) {
      return sendResponse(res, 400, false, "No education found.");
    }
    return sendResponse(
      res,
      200,
      true,
      "Successfully fetched education.",
      education
    );
  }, res);
};

const deleteEduImages = async (req, res) => {
  return asyncErrorHandler(async () => {
    const { eduId, imageUrls } = req.body;
    const education = await EducationalEntity.findById(eduId);
    if (!education) {
      return sendResponse(res, 404, false, "Education not found.");
    }

    const deleteImagePromises = imageUrls.map(async (imageUrl) => {
      const imageIdentifier = extractImageIdentifier(imageUrl);
      const deletedImage = await deleteImageFromStorage(
        imageIdentifier,
        eduId,
        "edu-images"
      );
      education.images = education.images.filter(
        (img) => img !== imageIdentifier
      );
    });
    await Promise.all(deleteImagePromises);
    let updatedEducation = await findAndUpdateEntity({ _id: eduId }, education); //will update the existing education, as education is an instance of existing one
    if (!updatedEducation) {
      return sendResponse(res, 404, false, "Unable to save changes.");
    }
    return sendResponse(res, 200, true, "Deleted successfully.");
  }, res);
};

module.exports = {
  addEducationTypes,
  addEducationalEntities,
  editEduEntities,
  getEducation,
  deleteEduEntities,
  getEducationById,
  deleteEduImages,
};
