const { asyncHandler } = require("../helper/async-error.helper");
const User = require("../model/user.model");
const mongoose = require("mongoose");
const OTP = require("../model/otp.model");

const findUserByEmail = async (email) => {
  return asyncHandler(async () => {
    const user = await User.findOne({ email: email }).exec();
    return user;
  });
};


const createUser = async (info) => {
  return asyncHandler(async () => {
    const user = new User(info);

    const savedUser = await user.save();
    return savedUser instanceof User ? savedUser.toJSON() : false;
  });
};

const updateCustomerById = async (customerId, info) => {
  return asyncHandler(async () => {
    const result = await User.updateOne(
      { _id: new mongoose.Types.ObjectId(customerId) },
      { $set: info },
      { new: true }
    );
    return result.modifiedCount > 0;
  });
};

const saveOtp = async (info) => {
  return asyncHandler(async () => {
    const otpEntry = new OTP(info);
    await otpEntry.save();
  });
};

module.exports = {
  findUserByEmail,
  createUser,
  updateCustomerById,
  saveOtp,
};