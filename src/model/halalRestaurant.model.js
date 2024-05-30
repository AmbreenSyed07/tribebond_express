/** @format */

const mongoose = require("mongoose");

const halalRestaurantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: false,
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
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        reviewText: { type: String },
      },
    ],
    website: {
      type: String,
      trim: true,
      // match: [
      //   /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/,
      //   "Please enter a valid URL",
      // ],
    },
    images: [
      {
        type: String, // Assuming these are URLs to images
        required: false,
      },
    ],
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
      type: Boolean,
      default: true, // Default status set to 1
    },
  },
  {
    timestamps: true, // Enables createdAt and updatedAt fields automatically
    collation: { locale: "en", strength: 2 },
  }
);

const HalalRestaurant = mongoose.model(
  "HalalRestaurant",
  halalRestaurantSchema
);

module.exports = HalalRestaurant;
