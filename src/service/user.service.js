const { asyncHandler } = require("../helper/async-error.helper");
const User = require("../model/user.model");
const mongoose = require("mongoose");
const OTP = require("../model/otp.model");
const Feedback = require("../model/feedback.model");
const { base_url } = require("../helper/local.helpers");

const findUserByEmail = async (email) => {
  return asyncHandler(async () => {
    const user = await User.findOne({ email: email }).exec();
    if (user && user.profilePicture) {
      user.profilePicture = `${base_url}public/data/profile/${user._id}/${user.profilePicture}`;
    }
    return user ? user.toJSON() : false;
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

const saveFeedbackFromUser = async (info) => {
  return asyncHandler(async () => {
    const feedback = new Feedback(info);
    const savedFeedback = await feedback.save();
    return savedFeedback instanceof Feedback ? savedFeedback.toJSON() : false;
  });
};

module.exports = {
  findUserByEmail,
  createUser,
  updateCustomerById,
  saveOtp,
  saveFeedbackFromUser,
};