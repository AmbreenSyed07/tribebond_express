/** @format */

const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema({
  jobTitle: {
    type: String,
    required: true,
  },
  jobDetails: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  contactEmail: {
    type: String,
    required: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  status: {
    type: Boolean,
    default: true,
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

const Job = mongoose.model("Job", jobSchema);

module.exports = Job;
