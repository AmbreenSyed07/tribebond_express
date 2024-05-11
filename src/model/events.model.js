const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    time: {
      type: String, // Consider using String if the time does not need to be parsed, or Date if it includes date and time
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: false, // Change to true if the phone number is required
    },
    reviews: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Optional: more fields can be added to the review object
        reviewText: { type: String },
      },
    ],
    thumbnail: {
      type: String, // URL to an image file
      required: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Assuming 'User' is your user model
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Assuming 'User' is your user model
      required: false,
    },
    status: {
      type: Number,
      default: 1, // Default status set to 1
    },
  },
  {
    timestamps: true, // Enables createdAt and updatedAt fields automatically
  }
);

const Event = mongoose.model("Event", eventSchema);

module.exports = Event;

