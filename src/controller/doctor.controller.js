/** @format */

const { asyncErrorHandler } = require("../helper/async-error.helper");
const { sendResponse } = require("../helper/local.helpers");
const {
  isNotEmpty,
  isPhoneNo,
  isEmail,
  isWebsite,
} = require("../helper/validate.helpers");
const {
  createDoctor,
  findAndUpdateDoctor,
  findDoctorByIdHelper,
  findDoctorById,
  findDoctorsByCity,
  searchDoctors,
} = require("../service/doctor.service");
const {
  extractImageIdentifier,
  deleteImageFromStorage,
  uploadAndCreateImage,
} = require("../helper/upload.helpers");

const addDoctor = async (req, res) => {
  return asyncErrorHandler(async () => {
    const { _id: userId } = req.tokenData;
    const {
      name,
      description,
      address,
      city,
      phone,
      email,
      services,
      website,
    } = req.body;
    let doctor_images = req && req.files && req.files.images;

    if (!isNotEmpty(name)) {
      return sendResponse(res, 400, false, "Please enter the name.");
    } else if (!isNotEmpty(address)) {
      return sendResponse(res, 400, false, "Please enter an address.");
    } else if (!isNotEmpty(city)) {
      return sendResponse(res, 400, false, "Please enter the city.");
    } else if (!isNotEmpty(phone) || !isPhoneNo(phone)) {
      return sendResponse(
        res,
        400,
        false,
        "Please enter a valid contact number."
      );
    } else if (!isNotEmpty(email) || !isEmail(email)) {
      return sendResponse(res, 400, false, "Please enter your valid email.");
    } else if (!isNotEmpty(services)) {
      return sendResponse(
        res,
        400,
        false,
        "Please enter your provided services."
      );
    } else if (!isWebsite(website)) {
      return sendResponse(res, 400, false, "Please enter a valid website url.");
    } else if (!doctor_images || doctor_images.length <= 0) {
      return sendResponse(res, 400, false, "Please select images.");
    }

    const info = {
      name,
      description,
      address,
      city,
      phone,
      email,
      services,
      website,
      createdBy: userId,
    };

    const newDoctor = await createDoctor(info);
    if (!newDoctor) {
      return sendResponse(res, 400, false, "Unable to add new doctor.");
    } else {
      if (doctor_images) {
        let imgArray = [];
        if (!doctor_images[0]) {
          let fileName = await uploadAndCreateImage(
            doctor_images,
            "doctor",
            newDoctor._id,
            res
          );
          imgArray.push(fileName);
        } else {
          for (let img of doctor_images) {
            let fileName = await uploadAndCreateImage(
              img,
              "doctor",
              newDoctor._id,
              res
            );
            imgArray.push(fileName);
          }
        }
        let updatedDoctor = await findAndUpdateDoctor(
          { _id: newDoctor._id },
          {
            images: imgArray,
          }
        );
        if (!updatedDoctor) {
          return sendResponse(res, 400, false, "Unable to save images.");
        }
      }

      return sendResponse(
        res,
        200,
        true,
        "Successfully added new doctor.",
        newDoctor
      );
    }
  }, res);
};

const editDoctor = async (req, res) => {
  return asyncErrorHandler(async () => {
    const { id: doctorId } = req.params;
    const { _id: userId } = req.tokenData;
    const {
      name,
      description,
      address,
      city,
      phone,
      email,
      services,
      website,
    } = req.body;

    const checkDoctor = await findDoctorByIdHelper(doctorId);
    if (!checkDoctor) {
      return sendResponse(res, 404, false, "Doctor not found.");
    }

    if (checkDoctor.createdBy.toString() !== userId.toString()) {
      return sendResponse(
        res,
        403,
        false,
        "You are not authorized to edit this record."
      );
    }

    if (!isNotEmpty(name)) {
      return sendResponse(res, 400, false, "Please enter the name.");
    } else if (!isNotEmpty(address)) {
      return sendResponse(res, 400, false, "Please enter an address.");
    } else if (!isNotEmpty(city)) {
      return sendResponse(res, 400, false, "Please enter the city.");
    } else if (!isNotEmpty(phone) || !isPhoneNo(phone)) {
      return sendResponse(
        res,
        400,
        false,
        "Please enter a valid contact number."
      );
    } else if (!isNotEmpty(email) || !isEmail(email)) {
      return sendResponse(res, 400, false, "Please enter your valid email.");
    } else if (!isNotEmpty(services)) {
      return sendResponse(
        res,
        400,
        false,
        "Please enter your provided services."
      );
    } else if (!isWebsite(website)) {
      return sendResponse(res, 400, false, "Please enter a valid website url.");
    }

    if (req.files) {
      const { images } = req.files;
      await editImage(doctorId, images, res);
    }

    const findInfo = { _id: doctorId, status: true };
    const setInfo = {
      name,
      description,
      address,
      city,
      phone,
      email,
      services,
      website,
      updatedBy: userId,
    };

    const doctor = await findAndUpdateDoctor(findInfo, setInfo);
    if (!doctor) {
      return sendResponse(res, 400, false, "Unable to update doctor info.");
    } else {
      return sendResponse(
        res,
        200,
        true,
        "Successfully updated doctor info.",
        doctor
      );
    }
  }, res);
};

const editImage = async (doctorId, images, res) => {
  const doctor = await findDoctorByIdHelper(doctorId);
  if (!doctor) {
    return sendResponse(res, 400, false, "Doctor not found.");
  }

  // Assuming images is an array of files
  const imagePaths = [];
  if (!images[0]) {
    let fileName = await uploadAndCreateImage(images, "doctor", doctorId, res);
    imagePaths.push(fileName);
  } else {
    for (let file of images) {
      let fileName = await uploadAndCreateImage(file, "doctor", doctorId, res);
      imagePaths.push(fileName);
    }
  }

  doctor.images = [...doctor.images, ...imagePaths];
  await doctor.save();
};

const getDoctors = async (req, res) => {
  return asyncErrorHandler(async () => {
    const { city } = req.tokenData;

    const { query } = req.query;

    let doctors;
    if (query) {
      doctors = await searchDoctors(query);
    } else {
      doctors = await findDoctorsByCity(city);
    }

    if (!doctors) {
      return sendResponse(res, 400, false, "No doctors found.");
    }

    return sendResponse(
      res,
      200,
      true,
      "Successfully fetched doctors.",
      doctors
    );
  }, res);
};

const getDoctorById = async (req, res) => {
  return asyncErrorHandler(async () => {
    let { id } = req.params;
    let doctor = await findDoctorById(id);
    if (!doctor) {
      return sendResponse(res, 400, false, "Doctor not found.");
    }
    return sendResponse(res, 200, true, "Successfully fetched doctor.", doctor);
  }, res);
};

const deleteDoctorImages = async (req, res) => {
  return asyncErrorHandler(async () => {
    const { doctorId, imageUrls } = req.body;
    const { _id: userId } = req.tokenData;

    if (!doctorId) {
      return sendResponse(res, 400, false, "Please select a record id.");
    }

    const doctor = await findDoctorByIdHelper(doctorId);
    if (!doctor) {
      return sendResponse(res, 404, false, "Doctor not found");
    }
    if (doctor.createdBy.toString() !== userId.toString()) {
      return sendResponse(
        res,
        403,
        false,
        "You are not authorized to edit this record."
      );
    } else if (!imageUrls || imageUrls.length <= 0) {
      return sendResponse(res, 400, false, "Please select images to delete.");
    }

    const deleteImagePromises = imageUrls.map(async (imageUrl) => {
      const imageIdentifier = extractImageIdentifier(imageUrl);
      const deletedImage = await deleteImageFromStorage(
        imageIdentifier,
        doctorId,
        "doctor"
      );
      doctor.images = doctor.images.filter((img) => img !== imageIdentifier);
    });
    await Promise.all(deleteImagePromises);
    let updatedDoctor = await findAndUpdateDoctor({ _id: doctorId }, doctor);
    if (!updatedDoctor) {
      return sendResponse(res, 404, false, "Unable to save changes.");
    }
    return sendResponse(res, 200, true, "Deleted successfully.");
  }, res);
};

const addDoctorReview = async (req, res) => {
  return asyncErrorHandler(async () => {
    const { _id: userId } = req.tokenData;
    let { doctorId, review } = req.body;
    if (!doctorId) {
      return sendResponse(res, 400, false, "Please select a record id.");
    }

    if (!isNotEmpty(review)) {
      return sendResponse(res, 400, false, "Please write a review.");
    }
    let doctor = await findDoctorByIdHelper(doctorId);
    if (!doctor) {
      return sendResponse(res, 404, false, "Doctor not found.");
    }
    let newReview = { user: userId, reviewText: review };
    doctor.reviews.unshift(newReview);
    await doctor.save();
    return sendResponse(res, 200, true, "Successfully added your review.");
  }, res);
};

const searchDoctor = async (req, res) => {
  return asyncErrorHandler(async () => {
    const { query } = req.body;

    if (!query) {
      return sendResponse(res, 400, false, "Query parameter is required.");
    }

    const doctors = await searchDoctors(query);
    if (!doctors || doctors.length === 0) {
      return sendResponse(res, 404, false, "No doctors found.");
    }

    return sendResponse(
      res,
      200,
      true,
      "Successfully fetched doctors.",
      doctors
    );
  }, res);
};

const deleteDoctor = async (req, res) => {
  return asyncErrorHandler(async () => {
    const { id } = req.params;
    const { _id: userId } = req.tokenData;

    const doctor = await findDoctorByIdHelper(id);
    if (!doctor) {
      return sendResponse(res, 404, false, "Record not found");
    }
    if (doctor.createdBy.toString() !== userId.toString()) {
      return sendResponse(
        res,
        403,
        false,
        "You are not authorized to delete this record."
      );
    }

    const deletedDoctor = await findAndUpdateDoctor(
      { _id: id },
      {
        status: false,
        updatedBy: userId,
      }
    );
    if (!deletedDoctor) {
      return sendResponse(
        res,
        403,
        false,
        "Some error occurred, please try again later."
      );
    }

    return sendResponse(res, 200, true, "Successfully deleted record.");
  }, res);
};

module.exports = {
  addDoctor,
  editDoctor,
  getDoctors,
  getDoctorById,
  deleteDoctorImages,
  addDoctorReview,
  searchDoctor,
  deleteDoctor,
};
