/** @format */

const { asyncHandler } = require("../helper/async-error.helper");
const Job = require("../model/jobs.model");

const createJob = async (jobData) => {
  return asyncHandler(async () => {
    const job = new Job(jobData);
    const savedJob = await job.save();
    return savedJob instanceof Job ? savedJob.toJSON() : false;
  });
};

const getJobsByLocation = async (location) => {
  return asyncHandler(async () => {
    const jobs = await Job.find({ location, status: true });
    return jobs.length > 0 ? jobs : false;
  });
};

const findJobById = async (info) => {
  return asyncHandler(async () => {
    const job = await Job.findOne(info).exec();
    return job ? job : false;
  });
};

const searchJobs = async (query) => {
  return asyncHandler(async () => {
    const jobs = await Job.find({
      $or: [
        { jobTitle: { $regex: query, $options: "i" } },
        { location: { $regex: query, $options: "i" } },
      ],
      status: true,
    });
    return jobs;
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
