const fsPromises = require("fs").promises;
const fs = require("fs");
const path = require("path");

/**
 * Handles asynchronous operations by wrapping them in a try-catch block.
 *
 * @param {Function} asyncOperation - The asynchronous operation to be executed.
 * @returns {Promise<any>} - Resolves with the result of the operation or rejects with an error.
 */
const asyncHandler = async (asyncOperation) => {
  try {
    return await asyncOperation();
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};

/**
 * Handles asynchronous operations and logs errors.
 *
 * @param {Function} asyncOperation - The asynchronous operation to execute.
 * @param {Object} response - The response object for handling HTTP responses.
 * @returns {Promise} A Promise that resolves the result of the asyncOperation or an error response.
 */
const asyncErrorHandler = async (asyncOperation, response) => {
  try {
    return await asyncOperation();
  } catch (error) {
    console.error(error);
    // await logErrorToFile(error);
    return response
      .status(500)
      .json({ success: false, message: "Something went wrong." });
  }
};

/**
 * Logs an error to a file.
 *
 * @param {Error} error - The error to be logged.
 */
async function logErrorToFile(error) {
  try {
    const logEntry = createLogEntry(error);
    await appendLogEntryToFile(logEntry);
  } catch (err) {
    console.error("Error writing error log to file:", err);
  }
}

/**
 * Creates a log entry object based on the error.
 *
 * @param {Error} error - The error to create a log entry for.
 * @returns {Object} A log entry object with timestamp, level, message, and stack properties.
 */
function createLogEntry(error) {
  return {
    timestamp: new Date().toISOString(),
    level: "error",
    message: error.message,
    stack: error.stack,
  };
}

/**
 * Appends a log entry to a file.
 *
 * @param {Object} logEntry - The log entry to append to the file.
 */
async function appendLogEntryToFile(logEntry) {
  const logEntryJson = JSON.stringify(logEntry, null, 2);
  const logFilePath = path.join(__dirname, "..", "logs");
  // Check if the directory exists, create it if not
  if (!fs.existsSync(logFilePath)) {
    fs.mkdirSync(logFilePath, { recursive: true }, (err) => {
      throw new Error(err.message);
    });
  }
  await fsPromises.appendFile(logFilePath + "/error.log", logEntryJson + "\n");
}

module.exports = { asyncErrorHandler, asyncHandler };
