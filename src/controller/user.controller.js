const { asyncErrorHandler } = require("../helper/async-error.helper");
const { hashPassword, comparePassword } = require("../helper/bcrypt.helpers");
const {
  isNotEmpty,
  isEmail,
  isPassword,
} = require("../helper/validate.helpers");
const { fileUpload } = require("../helper/upload.helpers");
const { sendResponse } = require("../helper/local.helpers");
const {
  findUserByEmail,
  createUser,
  updateCustomerById,
  saveOtp,
} = require("../service/user.service");
const { createToken } = require("../helper/jwt.helpers");
const { getLoginOTPVerificationBody } = require("../views/email.views");
const { generateUniqueOtp } = require("../helper/otp.helpers");

const logInUser = async (req, res) => {
  return asyncErrorHandler(async () => {
    const { email, password } = req.body;

    // Validate customer input
    if (!isEmail(email) || !isPassword(password)) {
      return sendResponse(res, 400, false, "Invalid login data.");
    }
    const user = await findUserByEmail(email);

    if (!user || !comparePassword(password, user.password)) {
      return sendResponse(res, 401, false, "Invalid credentials.");
    }

    // Directly use customer.password instead of redeclaring it
    const {
      password: hashPassword,
      followers,
      following,
      ...userWithoutPassword
    } = user;
    const token = createToken({
      ...userWithoutPassword,
    });

    const otp = await generateUniqueOtp();
    // return
    // let optInfo = { userId: userWithoutPassword._id, otp };
    // let savedOtp = await saveOtp(optInfo);
    // if (!savedOtp) {
    //   return sendResponse(res, 400, false, "Something went wrong.");
    // } else {
    //   let to = email;
    //   let subject = "Secure Your Login - Verification Code - Tribebond";
    //   let body = getLoginOTPVerificationBody({
    //     otp,
    //     firstName: userWithoutPassword.firstName,
    //     lastName: userWithoutPassword.lastName,
    //   });

    //   await sendEmail(to, subject, body);
    // }

    return sendResponse(res, 200, true, "Login successful.", {
      token,
      user: userWithoutPassword,
    });
  }, res);
};

const registerUser = async (req, res) => {
  return asyncErrorHandler(async () => {
    const {
      firstName,
      lastName,
      email,
      password,
      confirmPwd,
      gender,
      city,
      state,
      religion,
      longitude,
      latitude,
    } = req.body;
    let profilePicture = req.files && req.files.profilePicture;

    if (
      ![
        firstName,
        lastName,
        email,
        password,
        confirmPwd,
        gender,
        city,
        state,
        religion,
        // longitude,
        // latitude,
      ].every(isNotEmpty)
    ) {
      return sendResponse(res, 400, false, "Invalid  data.");
    } else if (!isEmail(email)) {
      return sendResponse(
        res,
        400,
        false,
        "Please enter a valid email address."
      );
    } else if (!isPassword(password)) {
      return sendResponse(
        res,
        400,
        false,
        "Password should be at least 6 digits long."
      );
    } else if (password != confirmPwd) {
      return sendResponse(res, 400, false, "Your passwords do not match.");
    } else {
      let existingEmail = await findUserByEmail(email);
      if (existingEmail) {
        return sendResponse(
          res,
          400,
          false,
          "This email already exists, try using another one or sign in."
        );
      }

      let hashPwd = hashPassword(password);
      let info = {
        firstName,
        lastName,
        email,
        password: hashPwd,
        gender,
        city,
        state,
        religion,
        longitude,
        latitude,
      };

      let user = await createUser(info);
      if (!user) {
        return sendResponse(res, 400, false, "Unable to signup.");
      } else {
        let profile_pic;
        if (profilePicture) {
          const newFile = await fileUpload(
            profilePicture,
            `profile/${user._id}/`,
            ["jpg", "jpeg", "png", "gif", "webp", "avif"],
            true,
            undefined,
            undefined,
            0,
            10
          );
          if (newFile.ok === false) {
            return sendResponse(res, 400, false, newFile.message);
          }
          profile_pic = newFile.fileName;
        }

        if (profile_pic) {
          let updatedUser = await updateCustomerById(user._id, {
            profilePicture: profile_pic,
          });
          if (!updatedUser) {
            return sendResponse(
              res,
              400,
              false,
              "Unable to save profile picture."
            );
          }
        }

        // const otp = await generateUniqueOtp();
        // let optInfo = { userId: user._id, otp };
        // let savedOtp = await saveOtp(optInfo);
        // if (!savedOtp) {
        //   return sendResponse(res, 400, false, "Something went wrong.");
        // } else {
        //   let to = email;
        //   let subject = "Secure Your Login - Verification Code - Tribebond";
        //   let body = getRegisterOTPVerificationBody();

        //   await sendEmail(to, subject, body);
        // }
        //
        return sendResponse(res, 200, "User registered successfully.");
      }
    }
  }, res);
};

// const followUser = async (req, res) => {
//   return asyncErrorHandler(async () => {
//     const { _id: followerId } = req.tokenData._doc;
//     const { _id: userId } = req.body;
//     let followerAdded = await addFollower(followerId, userId);
//     if (!followerAdded) {
//       return sendResponse(res, 400, false, "Unable to follow.");
//     }
//     let followingAdded = await addFollowing(followerId, userId);
//   }, res);
// };

module.exports = { registerUser, logInUser };
