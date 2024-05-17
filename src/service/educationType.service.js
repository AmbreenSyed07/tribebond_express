const { asyncHandler } = require("../helper/async-error.helper");
const { base_url } = require("../helper/local.helpers");
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

// const getEduTypeAndEntities = async () => {
//   return asyncHandler(async () => {
//     let education = await EducationType.aggregate([
//       {
//         $lookup: {
//           from: "educationalentities", // The collection to join
//           localField: "_id", // Field from the input documents
//           foreignField: "type", // Field from the documents of the "from" collection
//           as: "entities", // Output array field with the joined documents
//         },
//       },
//       {
//         $project: {
//           typeName: 1,
//           description: 1,
//           entities: {
//             $filter: {
//               input: "$entities",
//               as: "entity",
//               cond: { $eq: ["$$entity.type", "$_id"] },
//             },
//           },
//         },
//       },
//     ]);
//     return education ? education : false;
//   });
// };

const getEduTypeAndEntities = async () => {
  return asyncHandler(async () => {
    let education = await EducationType.aggregate([
      {
        $lookup: {
          from: "educationalentities", // The collection to join
          let: { eduTypeId: "$_id" }, // Define variable to use in the pipeline
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$type", "$$eduTypeId"] }, // Ensures the type matches
                    { $eq: ["$status", 1] }, // Additional condition for status = 1
                  ],
                },
              },
            },
          ],
          as: "entities", // Output array field with the joined documents
        },
      },
      {
        $project: {
          typeName: 1,
          description: 1,
          entities: 1, // Already filtered entities by the lookup pipeline
        },
      },
    ]);

    if (education.length > 0) {
      // Map through education and check for a thumbnail
      const modifiededucation = education.map((entity) => {
        let newEntities = entity?.entities?.map((edu) => {
          let entityObj = edu;
          if (entityObj.thumbnail) {
            // Modify the thumbnail path
            entityObj.thumbnail = `${base_url}public/data/edu-thumbnail/${entityObj._id}/${entityObj.thumbnail}`;
          }
          if (entityObj.images && entityObj.images.length > 0) {
            entityObj.images = entityObj.images.map((img) => {
              return `${base_url}public/data/edu-images/${entityObj._id}/${img}`;
            });
          }
          edu = entityObj;
          return edu; // Return the original event if no thumbnail
        });
        entity.entities = newEntities;
        return entity;
      });
      return modifiededucation;
    } else {
      return false;
    }
  });
};

const getEduTypeAndEntitiesById = async (id) => {
  return asyncHandler(async () => {
    let education = await EducationalEntity.findOne({
      _id: id,
      status: 1,
    })
      .populate("reviews.user", "firstName lastName profilePicture")
      .exec();

    if (education) {
      // let newEntities = education?.entities?.map((edu) => {
      let entityObj = education;

      entityObj?.reviews &&
        entityObj?.reviews.length > 0 &&
        entityObj?.reviews.forEach((review) => {
          if (
            review.user &&
            review.user.profilePicture &&
            !review.user.profilePicture.startsWith(base_url)
          ) {
            review.user.profilePicture = `${base_url}public/data/profile/${review.user._id}/${review.user.profilePicture}`;
          }
        });

      if (entityObj.thumbnail) {
        entityObj.thumbnail = `${base_url}public/data/edu-thumbnail/${entityObj._id}/${entityObj.thumbnail}`;
      }
      if (entityObj.images && entityObj.images.length > 0) {
        entityObj.images = entityObj.images.map((img) => {
          return `${base_url}public/data/edu-images/${entityObj._id}/${img}`;
        });
      }
      // edu = entityObj;
      return entityObj;
      // });
      // education.entities = newEntities;
      // return education;
    } else {
      return false;
    }
    // return;
  });
};

const findEducationByIdHelper = async (id) => {
  return asyncHandler(async () => {
    const education = await EducationalEntity.findById(id);
    return education ? education : false;
  });
};

module.exports = {
  createEducationType,
  findEduType,
  createEduEntity,
  findAndUpdateEntity,
  getEduTypeAndEntities,
  getEduTypeAndEntitiesById,
  findEducationByIdHelper,
};
