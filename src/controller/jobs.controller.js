/** @format */

const { asyncErrorHandler } = require("../helper/async-error.helper");
const { sendResponse } = require("../helper/local.helpers");
const {
  createJob,
  getJobsByLocation,
  findJobById,
  searchJobs,
  deleteOneJob,
} = require("../service/jobs.service");

const addJob = async (req, res) => {
  return asyncErrorHandler(async () => {
    const { jobTitle, jobDetails, location, contactEmail } = req.body;
    const { _id: userId } = req.tokenData;

    const newJob = await createJob({
      jobTitle,
      jobDetails,
      location,
      contactEmail,
      createdBy: userId,
    });

    if (!newJob) {
      return sendResponse(res, 400, false, "Unable to add new job.");
    }

    return sendResponse(res, 200, true, "Successfully added new job.", newJob);
  }, res);
};

const getJobByLocation = async (req, res) => {
  return asyncErrorHandler(async () => {
    const { city } = req.tokenData;

    const jobs = await getJobsByLocation(city);
    if (!jobs || jobs.length === 0) {
      return sendResponse(res, 404, false, "No jobs found in this location.");
    }

    return sendResponse(res, 200, true, "Successfully fetched jobs.", jobs);
  }, res);
};

const getJobById = async (req, res) => {
  return asyncErrorHandler(async () => {
    const { id } = req.params;

    const job = await findJobById({ _id: id, status: true });
    if (!job) {
      return sendResponse(res, 404, false, "Job not found.");
    }

    return sendResponse(res, 200, true, "Successfully fetched job.", job);
  }, res);
};

const searchJob = async (req, res) => {
  return asyncErrorHandler(async () => {
    const { query } = req.body;

    if (!query) {
      return sendResponse(res, 400, false, "Query parameter is required.");
    }

    const jobs = await searchJobs(query);
    if (!jobs || jobs.length === 0) {
      return sendResponse(res, 404, false, "No jobs found.");
    }

    return sendResponse(res, 200, true, "Successfully fetched jobs.", jobs);
  }, res);
};

const deleteJob = async (req, res) => {
  return asyncErrorHandler(async () => {
    const { id } = req.params;
    const { _id: userId } = req.tokenData;

    const jobRecord = await findJobById({ _id: id, status: true });
    if (!jobRecord) {
      return sendResponse(res, 404, false, "Job not found");
    }
    if (jobRecord.createdBy.toString() !== userId.toString()) {
      return sendResponse(
        res,
        403,
        false,
        "You are not authorized to delete this job."
      );
    }

    const job = await deleteOneJob(id, userId);
    if (!job) {
      return sendResponse(
        res,
        403,
        false,
        "Some error occured, Please try again later."
      );
    }

    return sendResponse(res, 200, true, "Successfully deleted job.");
  }, res);
};

module.exports = {
  addJob,
  getJobByLocation,
  getJobById,
  searchJob,
  deleteJob,
};
