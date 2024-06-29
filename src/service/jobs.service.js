/** @format */

const { asyncHandler } = require("../helper/async-error.helper");
const { modifyResponse } = require("../helper/local.helpers");
const Job = require("../model/jobs.model");

const createJob = async (jobData) => {
  return asyncHandler(async () => {
    const job = new Job(jobData);
    const savedJob = await job.save();
    return savedJob instanceof Job ? savedJob.toJSON() : false;
  });
};

const getJobsByLocation = async (city) => {
  return asyncHandler(async () => {
    const jobs = await Job.find({ city, status: true })
      .populate("createdBy", "firstName lastName profilePicture")
      .sort({ createdAt: -1 })
      .exec();
    return jobs.length > 0 ? modifyResponse(jobs) : false;
  });
};

const findJobById = async (info) => {
  return asyncHandler(async () => {
    const job = await Job.findOne(info)
      .populate("createdBy", "firstName lastName profilePicture")
      .exec();
    return job ? modifyResponse([job]) : false;
  });
};

const searchJobs = async (query) => {
  return asyncHandler(async () => {
    const jobs = await Job.find({
      $or: [
        { jobTitle: { $regex: query, $options: "i" } },
        { city: { $regex: query, $options: "i" } },
      ],
      status: true,
    })
      .sort({ createdAt: -1 })
      .exec();
    return jobs ? modifyResponse(jobs) : false;
  });
};

const deleteOneJob = async (id, userId) => {
  return asyncHandler(async () => {
    const job = await Job.findOneAndUpdate(
      { _id: id, createdBy: userId },
      { $set: { status: false } },
      { new: true }
    );
    return job ? job : false;
  });
};

module.exports = {
  createJob,
  getJobsByLocation,
  findJobById,
  searchJobs,
  deleteOneJob,
};
