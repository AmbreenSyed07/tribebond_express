/** @format */

const { asyncHandler } = require("../helper/async-error.helper");
const { base_url } = require("../helper/local.helpers");
const HealthRecord = require("../model/health.model");

const createHealthRecord = async (info) => {
  return asyncHandler(async () => {
    const healthRecord = new HealthRecord(info);

    const savedHealthRecord = await healthRecord.save();
    return savedHealthRecord instanceof HealthRecord
      ? savedHealthRecord.toJSON()
      : false;
  });
};

const findAndUpdateHealthRecord = async (findInfo, setInfo) => {
  return asyncHandler(async () => {
    const healthRecord = await HealthRecord.findOneAndUpdate(
      findInfo,
      {
        $set: setInfo,
      },
      { new: true, runValidators: true }
    );
    return healthRecord ? healthRecord : false;
  });
};

const findHealthRecordById = async (id) => {
  return asyncHandler(async () => {
    let healthRecord = await HealthRecord.findById({ _id: id })
      .populate("reviews.user", "firstName lastName profilePicture")
      .populate("createdBy", "firstName lastName profilePicture")
      .exec();
    if (healthRecord) {
      let healthRecordObj = healthRecord.toObject();

      if (
        healthRecordObj.createdBy &&
        healthRecordObj.createdBy.profilePicture &&
        !healthRecordObj.createdBy.profilePicture.startsWith(base_url)
      ) {
        healthRecordObj.createdBy.profilePicture = `${base_url}public/data/profile/${healthRecordObj.createdBy._id}/${healthRecordObj.createdBy.profilePicture}`;
      }
      healthRecordObj?.reviews &&
        healthRecordObj?.reviews.length > 0 &&
        healthRecordObj?.reviews.forEach((review) => {
          if (
            review.user &&
            review.user.profilePicture &&
            !review.user.profilePicture.startsWith(base_url)
          ) {
            review.user.profilePicture = `${base_url}public/data/profile/${review.user._id}/${review.user.profilePicture}`;
          }
        });

      if (healthRecordObj.images && healthRecordObj.images.length > 0) {
        healthRecordObj.images = healthRecordObj.images.map((img) => {
          return `${base_url}public/data/health/${healthRecordObj._id}/${img}`;
        });
      }
      return healthRecordObj;
    } else {
      return false;
    }
  });
};

const findHealthRecordsByCity = async (city) => {
  return asyncHandler(async () => {
    const healthRecords = await HealthRecord.find({
      city: { $regex: `^${city}$`, $options: "i" },
      status: true,
    })
      .collation({ locale: "en", strength: 2 })
      .populate("reviews.user", "firstName lastName profilePicture")
      .populate("createdBy", "firstName lastName profilePicture")
      .exec();

    if (healthRecords.length > 0) {
      const modifiedHealthRecords = healthRecords.map((healthRecord) => {
        let healthRecordObj = healthRecord.toObject();

        if (
          healthRecordObj.createdBy &&
          healthRecordObj.createdBy.profilePicture &&
          !healthRecordObj.createdBy.profilePicture.startsWith(base_url)
        ) {
          healthRecordObj.createdBy.profilePicture = `${base_url}public/data/profile/${healthRecordObj.createdBy._id}/${healthRecordObj.createdBy.profilePicture}`;
        }

        healthRecordObj?.reviews &&
          healthRecordObj?.reviews.length > 0 &&
          healthRecordObj?.reviews.forEach((review) => {
            if (
              review.user &&
              review.user.profilePicture &&
              !review.user.profilePicture.startsWith(base_url)
            ) {
              review.user.profilePicture = `${base_url}public/data/profile/${review.user._id}/${review.user.profilePicture}`;
            }
          });

        if (healthRecordObj.images && healthRecordObj.images.length > 0) {
          healthRecordObj.images = healthRecordObj.images.map((img) => {
            return `${base_url}public/data/health/${healthRecordObj._id}/${img}`;
          });
        }
        return healthRecordObj;
      });
      return modifiedHealthRecords;
    } else {
      return false;
    }
  });
};

const findHealthRecordByIdHelper = async (id) => {
  return asyncHandler(async () => {
    const healthRecord = await HealthRecord.findById(id);
    return healthRecord ? healthRecord : false;
  });
};

const searchHealthRecords = async (query) => {
  return asyncHandler(async () => {
    const healthRecords = await HealthRecord.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { services: { $regex: query, $options: "i" } },
      ],
    });
    return healthRecords;
  });
};

module.exports = {
  createHealthRecord,
  findAndUpdateHealthRecord,
  findHealthRecordsByCity,
  findHealthRecordById,
  findHealthRecordByIdHelper,
  searchHealthRecords,
};
