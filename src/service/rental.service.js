/** @format */

const { asyncHandler } = require("../helper/async-error.helper");
const { modifyResponse } = require("../helper/local.helpers");
const Rental = require("../model/rental.model");

const createRental = async (info) => {
  return asyncHandler(async () => {
    const rental = new Rental(info);

    const savedRental = await rental.save();
    return savedRental instanceof Rental ? savedRental.toJSON() : false;
  });
};

const findAndUpdateRental = async (findInfo, setInfo) => {
  return asyncHandler(async () => {
    const rental = await Rental.findOneAndUpdate(
      findInfo,
      {
        $set: setInfo,
      },
      { new: true, runValidators: true }
    );
    return rental ? rental : false;
  });
};

const findRentalById = async (id) => {
  return asyncHandler(async () => {
    const rental = await Rental.findOne({ _id: id, status: true })
      .populate("reviews.user", "firstName lastName profilePicture")
      .populate("createdBy", "firstName lastName profilePicture")
      .exec();
    if (rental) {
      return modifyResponse([rental], "rental");
    } else {
      return false;
    }
  });
};

const findRentalsByCity = async (city) => {
  return asyncHandler(async () => {
    const rentals = await Rental.find({
      city: { $regex: `^${city}$`, $options: "i" },
      status: true,
    })
      .collation({ locale: "en", strength: 2 })
      .populate("reviews.user", "firstName lastName profilePicture")
      .populate("createdBy", "firstName lastName profilePicture")
      .exec();

    if (rentals.length > 0) {
      return modifyResponse(rentals, "rental");
    } else {
      return false;
    }
  });
};

const findRentalByIdHelper = async (id) => {
  return asyncHandler(async () => {
    const rental = await Rental.findOne({ _id: id, status: true });
    return rental ? rental : false;
  });
};

const searchRentals = async (query) => {
  return asyncHandler(async () => {
    const rentals = await Rental.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { city: { $regex: query, $options: "i" } },
      ],
      status: true,
    })
      .populate("reviews.user", "firstName lastName profilePicture")
      .populate("createdBy", "firstName lastName profilePicture")
      .exec();
    if (rentals.length > 0) {
      return modifyResponse(rentals, "rental");
    } else {
      return false;
    }
  });
};

module.exports = {
  createRental,
  findAndUpdateRental,
  findRentalsByCity,
  findRentalById,
  findRentalByIdHelper,
  searchRentals,
};
