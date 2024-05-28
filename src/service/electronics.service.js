/** @format */

const { asyncHandler } = require("../helper/async-error.helper");
const { base_url } = require("../helper/local.helpers");
const Electronic = require("../model/electronics.model");

const createElectronic = async (info) => {
  return asyncHandler(async () => {
    const electronic = new Electronic(info);

    const savedElectronic = await electronic.save();
    return savedElectronic instanceof Electronic
      ? savedElectronic.toJSON()
      : false;
  });
};

const findAndUpdateElectronic = async (findInfo, setInfo) => {
  return asyncHandler(async () => {
    const electronic = await Electronic.findOneAndUpdate(
      findInfo,
      {
        $set: setInfo,
      },
      { new: true, runValidators: true }
    );
    return electronic ? electronic : false;
  });
};

const findElectronicById = async (id) => {
  return asyncHandler(async () => {
    const electronic = await Electronic.findById({ _id: id })
      .populate("reviews.user", "firstName lastName profilePicture")
      .populate("createdBy", "firstName lastName profilePicture")
      .exec();
    if (electronic) {
      let electronicObj = electronic.toObject();

      if (
        electronicObj.createdBy &&
        electronicObj.createdBy.profilePicture &&
        !electronicObj.createdBy.profilePicture.startsWith(base_url)
      ) {
        electronicObj.createdBy.profilePicture = `${base_url}public/data/profile/${electronicObj.createdBy._id}/${electronicObj.createdBy.profilePicture}`;
      }
      electronicObj?.reviews &&
        electronicObj?.reviews.length > 0 &&
        electronicObj?.reviews.forEach((review) => {
          if (
            review.user &&
            review.user.profilePicture &&
            !review.user.profilePicture.startsWith(base_url)
          ) {
            review.user.profilePicture = `${base_url}public/data/profile/${review.user._id}/${review.user.profilePicture}`;
          }
        });

      if (electronicObj.images && electronicObj.images.length > 0) {
        electronicObj.images = electronicObj.images.map((img) => {
          return `${base_url}public/data/electronics/${electronicObj._id}/${img}`;
        });
      }
      return electronicObj;
    } else {
      return false;
    }
  });
};

const findElectronicsByCity = async (city) => {
  return asyncHandler(async () => {
    const electronics = await Electronic.find({
      city: { $regex: `^${city}$`, $options: "i" },
      status: true,
    })
      .collation({ locale: "en", strength: 2 })
      .populate("reviews.user", "firstName lastName profilePicture")
      .populate("createdBy", "firstName lastName profilePicture")
      .exec();

    if (electronics.length > 0) {
      const modifiedElectronics = electronics.map((electronic) => {
        let electronicObj = electronic.toObject();

        if (
          electronicObj.createdBy &&
          electronicObj.createdBy.profilePicture &&
          !electronicObj.createdBy.profilePicture.startsWith(base_url)
        ) {
          electronicObj.createdBy.profilePicture = `${base_url}public/data/profile/${electronicObj.createdBy._id}/${electronicObj.createdBy.profilePicture}`;
        }

        electronicObj?.reviews &&
          electronicObj?.reviews.length > 0 &&
          electronicObj?.reviews.forEach((review) => {
            if (
              review.user &&
              review.user.profilePicture &&
              !review.user.profilePicture.startsWith(base_url)
            ) {
              review.user.profilePicture = `${base_url}public/data/profile/${review.user._id}/${review.user.profilePicture}`;
            }
          });

        if (electronicObj.images && electronicObj.images.length > 0) {
          electronicObj.images = electronicObj.images.map((img) => {
            return `${base_url}public/data/electronics/${electronicObj._id}/${img}`;
          });
        }
        return electronicObj;
      });
      return modifiedElectronics;
    } else {
      return false;
    }
  });
};

const findElectronicByIdHelper = async (id) => {
  return asyncHandler(async () => {
    const electronic = await Electronic.findById(id);
    return electronic ? electronic : false;
  });
};

module.exports = {
  createElectronic,
  findAndUpdateElectronic,
  findElectronicsByCity,
  findElectronicById,
  findElectronicByIdHelper,
};
