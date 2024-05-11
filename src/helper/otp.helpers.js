const crypto = require("crypto");
const OTP = require("../model/otp.model");
/**
 * Generates a cryptographically strong 6-digit OTP.
 * @returns {string} A 6-digit OTP as a string.
 */
function generateOtp() {
  const otp = crypto.randomInt(100000, 1000000); // Generates a number from 100000 to 999999
  return otp.toString();
}

async function generateUniqueOtp() {
  let otp;
  let isUnique = false;

  while (!isUnique) {
    otp = generateOtp();
    const existingOtp = await OTP.findOne({ otp: otp }).exec();

    if (!existingOtp) {
      isUnique = true; // No existing OTP found, hence the generated OTP is unique
      // const newOtp = new OTP({ otp });
      // await newOtp.save(); // Save the unique OTP to the database
    }
  }

  return otp; // Return the unique OTP
}

module.exports = { generateOtp, generateUniqueOtp };
