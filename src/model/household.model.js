/** @format */

const mongoose = require("mongoose");

const householdSchema = new mongoose.Schema(
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
    reviews: [
      {
        user: {type: mongoose.Schema.Types.ObjectId, ref: "User"},
        reviewText: {type: String},
      },
    ],
    website: {
      type: String,
      trim: true,
    },
    thumbnail: {
      type: String,
      required: false,
    },
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
    collation: {locale: "en", strength: 2},
  }
);

const Household = mongoose.model("Household", householdSchema);

module.exports = Household;
