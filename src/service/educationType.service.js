const { asyncHandler } = require("../helper/async-error.helper");
const EducationType = require("../model/educationTypes.model");
const EducationalEntity = require("../model/educationalEntities.model");

const createEducationType = async (info) => {
  return asyncHandler(async () => {
    const eduType = new EducationType(info);

    const savedEduType = await eduType.save();
    return savedEduType instanceof EducationType
      ? savedEduType.toJSON()
      : false;
  });
};

const findEduType = async (info) => {
  return asyncHandler(async () => {
    const eduType = await EducationType.findOne(info).exec();
    return eduType;
  });
};

const createEduEntity = async (info) => {
  return asyncHandler(async () => {
    const eduEntity = new EducationalEntity(info);

    const savedEduEntity = await eduEntity.save();
    return savedEduEntity instanceof EducationalEntity
      ? savedEduEntity.toJSON()
      : false;
  });
};


const findAndUpdateEntity = async (findInfo, setInfo) => {
  return asyncHandler(async () => {
    const entity = await EducationalEntity.findOneAndUpdate(
      findInfo, // Match both ID and Type
      {
        $set: setInfo,
      },
      { new: true, runValidators: true } // Options to return the updated document and run schema validators
    );
    return entity ? entity : false;
  });
};

const getEduTypeAndEntities = async () => {
  return asyncHandler(async () => {
    let education = await EducationType.aggregate([
      {
        $lookup: {
          from: "educationalentities", // The collection to join
          localField: "_id", // Field from the input documents
          foreignField: "type", // Field from the documents of the "from" collection
          as: "entities", // Output array field with the joined documents
        },
      },
      {
        $project: {
          typeName: 1,
          description: 1,
          entities: {
            $filter: {
              input: "$entities",
              as: "entity",
              cond: { $eq: ["$$entity.type", "$_id"] },
            },
          },
        },
      },
    ]);
    return education ? education : false;
  });
};

module.exports = {
  createEducationType,
  findEduType,
  createEduEntity,
  findAndUpdateEntity,
  getEduTypeAndEntities,
};
