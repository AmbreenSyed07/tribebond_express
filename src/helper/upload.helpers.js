/** @format */

// const sharp = require("sharp");
const fs = require("fs");
const path = require("path");
const {guessExtensionFromType} = require("./mimeTypes.helpers");

// generate random (unique) image name
function getRandomFileName() {
  var timestamp = new Date().toISOString().replace(/[-:.]/g, "");
  var random = ("" + Math.random()).substring(2, 8);
  var random_number = timestamp + random;
  return random_number;
}
/**
 * NOTE: Uploads an image file, performs validations, and optionally generates a thumbnail.
 *
 * @param {object} file - The image file to be uploaded.
 * @param {object} destination - Destination directory for storing the uploaded file (after public/data/).
 *   @property {boolean} isMandatory - Indicates whether the parameter is mandatory.
 *   @property {string} value - Description of the parameter's value.
 *   @property {string} type - Data type of the parameter.
 *   @property {string} defaultValue - Default value if not specified.
 * @param {object} allowedExtensions - List of allowed file extensions.
 *   @property {boolean} isMandatory - Indicates whether the parameter is mandatory.
 *   @property {string[]} value - Description of the parameter's value.
 *   @property {string} type - Data type of the parameter.
 *   @property {string[]} defaultValue - Default value if not specified (all extensions allowed).
 * @param {object} maxFileSizeInMB - Maximum allowed file size in megabytes.
 *   @property {boolean} isMandatory - Indicates whether the parameter is mandatory.
 *   @property {number} value - Description of the parameter's value.
 *   @property {string} type - Data type of the parameter.
 *   @property {number} defaultValue - Default value if not specified.
 * @param {object} minFileSizeInMB - Minimum required file size in megabytes.
 *   @property {boolean} isMandatory - Indicates whether the parameter is mandatory.
 *   @property {number} value - Description of the parameter's value.
 *   @property {string} type - Data type of the parameter.
 *   @property {number} defaultValue - Default value if not specified.
 * @param {object} thumbnail - Flag to generate a thumbnail version of the uploaded image.
 *   @property {boolean} isMandatory - Indicates whether the parameter is mandatory.
 *   @property {boolean} value - Description of the parameter's value.
 *   @property {string} type - Data type of the parameter.
 *   @property {boolean} defaultValue - Default value if not specified.
 * @param {object} height - Height of the thumbnail if generated.
 *   @property {boolean} isMandatory - Indicates whether the parameter is mandatory.
 *   @property {number} value - Description of the parameter's value.
 *   @property {string} type - Data type of the parameter.
 *   @property {number} defaultValue - Default value if not specified.
 * @param {object} width - Width of the thumbnail if generated.
 *   @property {boolean} isMandatory - Indicates whether the parameter is mandatory.
 *   @property {number} value - Description of the parameter's value.
 *   @property {string} type - Data type of the parameter.
 *   @property {number} defaultValue - Default value if not specified.
 * @returns {object} - Object with upload status and information.
 *
 * @typedef {Object} UploadResult
 * @property {boolean} ok - Indicates if the upload was successful.
 * @property {string} status - Status of the upload ("success" or "failure").
 * @property {string} message - Message describing the upload outcome.
 * @property {string} fileName - Name of the uploaded file.
 * @property {string} filePath - Full path to the uploaded file.
 *
 * @example
 * const result = await fileUpload(
 *   file,
 *   destination.value,
 *   allowedExtensions.value,
 *   maxFileSizeInMB.value,
 *   minFileSizeInMB.value,
 *   thumbnail.value,
 *   height.value,
 *   width.value
 * );
 * console.log(result);
 */

// Image Upload
const fileUpload = async (
  file,
  destination = "images/",
  allowedExtensions = [],
  thumbnail = false,
  height = 200,
  width = 200,
  minFileSizeInMB = 0,
  maxFileSizeInMB = 10
) => {
  try {
    // Get the path for uploading files
    const uploadFilepath = path.join(
      __dirname,
      "..",
      "public",
      "data",
      destination
    );
    // Generate a random (unique) image name
    const uniqueName = getRandomFileName();

    // Get the file extension and mimetype
    const fileExt = path.extname(file.name).replace(".", "");
    const fileMimetype = file.mimetype;
    // Calculate the file size in MB
    const fileSizeInMB = parseFloat(file.size / (1024 * 1024)).toFixed(2);

    // Create file names
    const fileName = `${uniqueName}.${fileExt}`;
    const thumbnailFileName = `${uniqueName}_w${height}_h${width}.${fileExt}`;

    // Check if the extension or mimetype is valid
    const checkedExt = await guessExtensionFromType(fileMimetype, fileExt);
    if (checkedExt !== fileExt.toLocaleLowerCase()) {
      throw new Error(`Not a "${fileExt}" type file.`);
    }

    // Check if allowed extensions are specified and if the current extension is allowed
    if (allowedExtensions.length !== 0) {
      if (!allowedExtensions.includes(fileExt.toLocaleLowerCase())) {
        throw new Error(
          `Only ${allowedExtensions.join("|")} files are allowed.`
        );
      }
    }

    // Check if the file size is within limits
    if (fileSizeInMB > maxFileSizeInMB) {
      throw new Error(
        `Please select files size less than ${maxFileSizeInMB} MB.`
      );
    }
    if (fileSizeInMB < minFileSizeInMB) {
      throw new Error(
        `Please select files size more than ${minFileSizeInMB} MB.`
      );
    }

    // Check if the upload directory exists, create it if not
    if (!fs.existsSync(uploadFilepath)) {
      fs.mkdirSync(uploadFilepath, {recursive: true}, (err) => {
        throw new Error(err.message);
      });
    }

    // Upload the file
    await file.mv(`${uploadFilepath}${fileName}`, (err) => {
      if (err) {
        throw new Error(err.message);
      } else {
        // If thumbnail generation is enabled
        if (thumbnail === true) {
          // sharp(`${uploadFilepath}${fileName}`)
          //   .resize(width, height)
          //   .toFile(`${uploadFilepath}${thumbnailFileName}`, function (err) {
          //     if (err) {
          //       throw new Error(err.message);
          //     } else {
          //       // Thumbnail generated successfully
          //     }
          //   });
        }
      }
    });

    return {
      ok: true,
      status: `success`,
      message: `File successfully uploaded.`,
      fileName,
      filePath: `${uploadFilepath}${fileName}`,
    };
  } catch (err) {
    return {ok: false, status: `failure`, message: err.message};
  }
};

/*****************************END*****************************/
module.exports = {
  fileUpload,
  getRandomFileName,
};
