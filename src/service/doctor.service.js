/** @format */

const { asyncHandler } = require("../helper/async-error.helper");
const { base_url, modifyResponse } = require("../helper/local.helpers");
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
    let doctor = await Doctor.findOne({ _id: id, status: true })
      .populate("reviews.user", "firstName lastName profilePicture")
      .populate("createdBy", "firstName lastName profilePicture")
      .exec();
    if (doctor) {
      return modifyResponse([doctor], "doctor");
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
      .sort({ createdAt: -1 })
      .exec();

    if (doctors.length > 0) {
      return modifyResponse(doctors, "doctor");
    } else {
      return false;
    }
  });
};

const findDoctorByIdHelper = async (id) => {
  return asyncHandler(async () => {
    const doctor = await Doctor.findOne({ _id: id, status: true });
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
      status: true,
    })
      .populate("reviews.user", "firstName lastName profilePicture")
      .populate("createdBy", "firstName lastName profilePicture")
      .sort({ createdAt: -1 })
      .exec();
    return doctors.length > 0 ? modifyResponse(doctors, "doctor") : false;
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
