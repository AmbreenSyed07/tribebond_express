/** @format */

const mongoose = require("mongoose");

const mosqueSchema = new mongoose.Schema(
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
      required: false,
    },
    khutbah: [
      {
        type: String,
        required: false,
      },
    ],
    website: {
      type: String,
      trim: true,
    },
    images: [
      {
        type: String,
        required: false,
      },
    ],
    reviews: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        reviewText: { type: String },
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    status: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    collation: { locale: "en", strength: 2 },
  }
);

const Mosque = mongoose.model("Mosque", mosqueSchema);

module.exports = Mosque;
