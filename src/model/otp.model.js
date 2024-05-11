const mongoose = require("mongoose");
const { Schema } = mongoose;

const otpSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  otp: {
    type: String,
    required: true,
    match: [/^\d{6}$/, "OTP must be exactly 6 digits long."], // Ensures the OTP is exactly 6 digits
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: { expires: "5m" },
  },
});

module.exports = mongoose.model("OTP", otpSchema);
