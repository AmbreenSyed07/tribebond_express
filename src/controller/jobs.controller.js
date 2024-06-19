/** @format */

const { asyncErrorHandler } = require("../helper/async-error.helper");
const { sendResponse } = require("../helper/local.helpers");
const { isNotEmpty } = require("../helper/validate.helpers");
const {
  createJob,
  getJobsByLocation,
  findJobById,
  searchJobs,
  deleteOneJob,
} = require("../service/jobs.service");

const addJob = async (req, res) => {
  return asyncErrorHandler(async () => {
    const { jobTitle, jobDetails, location, city, contactEmail } = req.body;
    const { _id: userId } = req.tokenData;

    if (!isNotEmpty(jobTitle)) {
      return sendResponse(res, 400, false, "Please enter a job title.");
    } else if (!isNotEmpty(jobDetails)) {
      return sendResponse(res, 400, false, "Please enter job details.");
    }
    if (!isNotEmpty(location)) {
      return sendResponse(res, 400, false, "Please enter a job location.");
    }
    if (!isNotEmpty(city)) {
      return sendResponse(res, 400, false, "Please enter city.");
    }
    if (!isNotEmpty(contactEmail)) {
      return sendResponse(res, 400, false, "Please enter a contact email.");
    }

    const newJob = await createJob({
      jobTitle,
      jobDetails,
      location,
      city,
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
    const { query } = req.query;

    let jobs;
    if (query) {
      jobs = await searchJobs(query);
    } else {
      jobs = await getJobsByLocation(city);
    }
    if (!jobs || jobs.length === 0) {
      return sendResponse(res, 404, false, "No jobs found in your location.");
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

const deleteJob = async (req, res) => {
  return asyncErrorHandler(async () => {
    const { id } = req.params;
    const { _id: userId } = req.tokenData;

    const jobRecord = await findJobById({ _id: id, status: true });
    if (!jobRecord) {
      return sendResponse(res, 404, false, "Job not found");
    }
    if (jobRecord[0].createdBy._id.toString() !== userId.toString()) {
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
  deleteJob,
};
