const { asyncErrorHandler } = require("../helper/async-error.helper");
const { sendResponse } = require("../helper/local.helpers");
const {
  createEducationType,
  findEduType,
  createEduEntity,
  findAndUpdateEntity,
  getEduTypeAndEntities,
} = require("../service/educationType.service");

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

module.exports = {
  addEducationTypes,
  addEducationalEntities,
  editEduEntities,
  getEducation,
  deleteEduEntities,
};
