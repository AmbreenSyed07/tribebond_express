/** @format */

const mongoose = require("mongoose");

const volunteerEventSchema = new mongoose.Schema(
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
    website: {
      type: String,
      required: false,
    },
    date: {
      type: Date,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
    reviews: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        reviewText: { type: String },
      },
    ],
    images: [
      {
        type: String,
        required: false,
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

const VolunteerEvent = mongoose.model("VolunteerEvent", volunteerEventSchema);

module.exports = VolunteerEvent;
