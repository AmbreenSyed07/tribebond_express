/** @format */

const { asyncHandler } = require("../helper/async-error.helper");
const { base_url } = require("../helper/local.helpers");
const Doctor = require("../model/doctor.model");

const createDoctor = async (info) => {
  return asyncHandler(async () => {
    const doctor = new Doctor(info);

    const savedDoctor = await doctor.save();
    return savedDoctor instanceof Doctor ? savedDoctor.toJSON() : false;
  });
};

const findAndUpdateDoctor = async (findInfo, setInfo) => {
  return asyncHandler(async () => {
    const doctor = await Doctor.findOneAndUpdate(
      findInfo,
      {
        $set: setInfo,
      },
      { new: true, runValidators: true }
    );
    return doctor ? doctor : false;
  });
};

const findDoctorById = async (id) => {
  return asyncHandler(async () => {
    let doctor = await Doctor.findById({ _id: id })
      .populate("reviews.user", "firstName lastName profilePicture")
      .populate("createdBy", "firstName lastName profilePicture")
      .exec();
    if (doctor) {
      let doctorObj = doctor.toObject();

      if (
        doctorObj.createdBy &&
        doctorObj.createdBy.profilePicture &&
        !doctorObj.createdBy.profilePicture.startsWith(base_url)
      ) {
        doctorObj.createdBy.profilePicture = `${base_url}public/data/profile/${doctorObj.createdBy._id}/${doctorObj.createdBy.profilePicture}`;
      }
      doctorObj?.reviews &&
        doctorObj?.reviews.length > 0 &&
        doctorObj?.reviews.forEach((review) => {
          if (
            review.user &&
            review.user.profilePicture &&
            !review.user.profilePicture.startsWith(base_url)
          ) {
            review.user.profilePicture = `${base_url}public/data/profile/${review.user._id}/${review.user.profilePicture}`;
          }
        });

      if (doctorObj.images && doctorObj.images.length > 0) {
        doctorObj.images = doctorObj.images.map((img) => {
          return `${base_url}public/data/doctor/${doctorObj._id}/${img}`;
        });
      }
      return doctorObj;
    } else {
      return false;
    }
  });
};

const findDoctorsByCity = async (city) => {
  return asyncHandler(async () => {
    const doctors = await Doctor.find({
      city: { $regex: `^${city}$`, $options: "i" },
      status: true,
    })
      .collation({ locale: "en", strength: 2 })
      .populate("reviews.user", "firstName lastName profilePicture")
      .populate("createdBy", "firstName lastName profilePicture")
      .exec();

    if (doctors.length > 0) {
      const modifiedDoctors = doctors.map((doctor) => {
        let doctorObj = doctor.toObject();

        if (
          doctorObj.createdBy &&
          doctorObj.createdBy.profilePicture &&
          !doctorObj.createdBy.profilePicture.startsWith(base_url)
        ) {
          doctorObj.createdBy.profilePicture = `${base_url}public/data/profile/${doctorObj.createdBy._id}/${doctorObj.createdBy.profilePicture}`;
        }

        doctorObj?.reviews &&
          doctorObj?.reviews.length > 0 &&
          doctorObj?.reviews.forEach((review) => {
            if (
              review.user &&
              review.user.profilePicture &&
              !review.user.profilePicture.startsWith(base_url)
            ) {
              review.user.profilePicture = `${base_url}public/data/profile/${review.user._id}/${review.user.profilePicture}`;
            }
          });

        if (doctorObj.images && doctorObj.images.length > 0) {
          doctorObj.images = doctorObj.images.map((img) => {
            return `${base_url}public/data/doctor/${doctorObj._id}/${img}`;
          });
        }
        return doctorObj;
      });
      return modifiedDoctors;
    } else {
      return false;
    }
  });
};

const findDoctorByIdHelper = async (id) => {
  return asyncHandler(async () => {
    const doctor = await Doctor.findById(id);
    return doctor ? doctor : false;
  });
};

const searchDoctors = async (query) => {
  return asyncHandler(async () => {
    const doctors = await Doctor.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { services: { $regex: query, $options: "i" } },
      ],
    });
    return doctors;
  });
};

module.exports = {
  createDoctor,
  findAndUpdateDoctor,
  findDoctorsByCity,
  findDoctorById,
  findDoctorByIdHelper,
  searchDoctors,
};
