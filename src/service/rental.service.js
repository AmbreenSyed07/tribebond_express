/** @format */

const { asyncHandler } = require("../helper/async-error.helper");
const { base_url } = require("../helper/local.helpers");
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
    const rental = await Rental.findById({ _id: id })
      .populate("reviews.user", "firstName lastName profilePicture")
      .populate("createdBy", "firstName lastName profilePicture")
      .exec();
    if (rental) {
      let rentalObj = rental.toObject();

      if (
        rentalObj.createdBy &&
        rentalObj.createdBy.profilePicture &&
        !rentalObj.createdBy.profilePicture.startsWith(base_url)
      ) {
        rentalObj.createdBy.profilePicture = `${base_url}public/data/profile/${rentalObj.createdBy._id}/${rentalObj.createdBy.profilePicture}`;
      }
      rentalObj?.reviews &&
        rentalObj?.reviews.length > 0 &&
        rentalObj?.reviews.forEach((review) => {
          if (
            review.user &&
            review.user.profilePicture &&
            !review.user.profilePicture.startsWith(base_url)
          ) {
            review.user.profilePicture = `${base_url}public/data/profile/${review.user._id}/${review.user.profilePicture}`;
          }
        });

      if (rentalObj.images && rentalObj.images.length > 0) {
        rentalObj.images = rentalObj.images.map((img) => {
          return `${base_url}public/data/rental/${rentalObj._id}/${img}`;
        });
      }
      return rentalObj;
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
      const modifiedRentals = rentals.map((rental) => {
        let rentalObj = rental.toObject();

        if (
          rentalObj.createdBy &&
          rentalObj.createdBy.profilePicture &&
          !rentalObj.createdBy.profilePicture.startsWith(base_url)
        ) {
          rentalObj.createdBy.profilePicture = `${base_url}public/data/profile/${rentalObj.createdBy._id}/${rentalObj.createdBy.profilePicture}`;
        }

        rentalObj?.reviews &&
          rentalObj?.reviews.length > 0 &&
          rentalObj?.reviews.forEach((review) => {
            if (
              review.user &&
              review.user.profilePicture &&
              !review.user.profilePicture.startsWith(base_url)
            ) {
              review.user.profilePicture = `${base_url}public/data/profile/${review.user._id}/${review.user.profilePicture}`;
            }
          });

        if (rentalObj.images && rentalObj.images.length > 0) {
          rentalObj.images = rentalObj.images.map((img) => {
            return `${base_url}public/data/rental/${rentalObj._id}/${img}`;
          });
        }
        return rentalObj;
      });
      return modifiedRentals;
    } else {
      return false;
    }
  });
};

const findRentalByIdHelper = async (id) => {
  return asyncHandler(async () => {
    const rental = await Rental.findById(id);
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
    });
    return rentals;
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
