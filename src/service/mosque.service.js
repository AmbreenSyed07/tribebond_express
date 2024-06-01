/** @format */

const { asyncHandler } = require("../helper/async-error.helper");
const { base_url } = require("../helper/local.helpers");
const Mosque = require("../model/mosque.model");

const createMosqueRecord = async (info) => {
  return asyncHandler(async () => {
    const mosqueRecord = new Mosque(info);

    const savedMosqueRecord = await mosqueRecord.save();
    return savedMosqueRecord instanceof Mosque
      ? savedMosqueRecord.toJSON()
      : false;
  });
};

const findAndUpdateMosqueRecord = async (findInfo, setInfo) => {
  return asyncHandler(async () => {
    const mosqueRecord = await Mosque.findOneAndUpdate(
      findInfo, // Match both ID and Type
      {
        $set: setInfo,
      },
      { new: true, runValidators: true } // Options to return the updated document and run schema validators
    );
    return mosqueRecord ? mosqueRecord : false;
  });
};

const findMosqueRecordById = async (id) => {
  return asyncHandler(async () => {
    const mosqueRecord = await Mosque.findById({ _id: id }).populate(
      "reviews.user",
      "firstName lastName profilePicture"
    );
    if (mosqueRecord) {
      let mosqueRecordObj = mosqueRecord.toObject();
      mosqueRecordObj?.reviews &&
        mosqueRecordObj?.reviews.length > 0 &&
        mosqueRecordObj?.reviews.forEach((review) => {
          if (
            review.user &&
            review.user.profilePicture &&
            !review.user.profilePicture.startsWith(base_url)
          ) {
            review.user.profilePicture = `${base_url}public/data/profile/${review.user._id}/${review.user.profilePicture}`;
          }
        });

      if (mosqueRecordObj.images && mosqueRecordObj.images.length > 0) {
        mosqueRecordObj.images = mosqueRecordObj.images.map((img) => {
          return `${base_url}public/data/mosque/${mosqueRecordObj._id}/${img}`;
        });
      }
      return mosqueRecordObj;
    } else {
      return false;
    }
  });
};

const findMosqueRecordsByCity = async (city) => {
  return asyncHandler(async () => {
    const mosqueRecords = await Mosque.find({
      city: { $regex: `^${city}$`, $options: "i" },
      status: true,
    })
      .collation({ locale: "en", strength: 2 })
      .populate("reviews.user", "firstName lastName profilePicture")
      .exec();
    if (mosqueRecords.length > 0) {
      const modifiedMosqueRecords = mosqueRecords.map((mosqueRecord) => {
        let mosqueRecordObj = mosqueRecord.toObject();

        mosqueRecordObj?.reviews &&
          mosqueRecordObj?.reviews.length > 0 &&
          mosqueRecordObj?.reviews.forEach((review) => {
            if (
              review.user &&
              review.user.profilePicture &&
              !review.user.profilePicture.startsWith(base_url)
            ) {
              review.user.profilePicture = `${base_url}public/data/profile/${review.user._id}/${review.user.profilePicture}`;
            }
          });

        if (mosqueRecordObj.images && mosqueRecordObj.images.length > 0) {
          mosqueRecordObj.images = mosqueRecordObj.images.map((img) => {
            return `${base_url}public/data/mosque/${mosqueRecordObj._id}/${img}`;
          });
        }
        return mosqueRecordObj;
      });
      return modifiedMosqueRecords;
    } else {
      return false;
    }
  });
};

const findMosqueRecordByIdHelper = async (id) => {
  return asyncHandler(async () => {
    const mosqueRecord = await Mosque.findById(id);
    return mosqueRecord ? mosqueRecord : false;
  });
};

const searchMosqueRecords = async (query) => {
  return asyncHandler(async () => {
    const mosqueRecords = await Mosque.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { city: { $regex: query, $options: "i" } },
      ],
    });
    return mosqueRecords.length > 0 ? mosqueRecords : false;
  });
};

module.exports = {
  createMosqueRecord,
  findAndUpdateMosqueRecord,
  findMosqueRecordsByCity,
  findMosqueRecordById,
  findMosqueRecordByIdHelper,
  searchMosqueRecords,
};
