const mongoose = require("mongoose");
const { Schema } = mongoose;

const educationalEntitySchema = new Schema({
  name: { type: String, required: true },
  type: { type: Schema.Types.ObjectId, ref: "EducationType", required: true },
  address: String,
  contactNumber: String,
  email: {
    type: String,
    trim: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      "Please fill a valid email address",
    ], // Regex for email validation
  },
  website: {
    type: String,
    trim: true,
    // match: [
    //   /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/,
    //   "Please enter a valid URL",
    // ],
  },
  offers: String,
  additionalInfo: Schema.Types.Mixed, // This can hold any additional structured data unique to the type if necessary
  status: {
    type: Number,
    default: 1, // Default status set to 1
  },
});

const EducationalEntity = mongoose.model(
  "EducationalEntity",
  educationalEntitySchema
);

module.exports = EducationalEntity;

