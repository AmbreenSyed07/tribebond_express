/** @format */
const moment = require("moment");

const base_url = `http://localhost:8713/`;
const front_base_url = `http://localhost:3000/`;

const capitalizeStr = (value) =>
  value[0].toUpperCase() + value.slice(1).toLowerCase();
const trimStr = (value) => capitalizeStr(value.toString().trim());


const formatArray = (arr) => {
  const words = arr.join(",");
  return words;
};

function padTo2Digits(num) {
  return num.toString().padStart(2, "0");
}

const filterDataValues = async (data) => {
  let newData = await Promise.all(data.map(async (item) => item.dataValues));
  return newData;
};

const formatDate = (str, date = new Date()) => {
  const yyyy = date.getFullYear(); //year
  const mm = padTo2Digits(date.getMonth() + 1); //month
  const dd = padTo2Digits(date.getDate()); //date
  const h = padTo2Digits(date.getHours()); //hours
  const i = padTo2Digits(date.getMinutes()); //minutes
  const s = padTo2Digits(date.getSeconds()); //seconds
  if (str === "yyyy-mm-dd") {
    return `${yyyy}-${mm}-${dd}`;
  }
  if (str === "dd-mm-yyyy") {
    return `${dd}-${mm}-${yyyy}`;
  }
  if (str === "yyyy-mm-dd h:i:s") {
    return `${yyyy}-${mm}-${dd} ${h}:${i}:${s}`;
  }
  if (str === "dd-mm-yyyy h:i:s") {
    return `${dd}-${mm}-${yyyy} ${h}:${i}:${s}`;
  }
  return date;
};

const generateInsertQueryValues = (data) => {
  const columns = [];
  const values = [];
  for (const key in data) {
    if (data.hasOwnProperty(key)) {
      columns.push(key);
      values.push(data[key]);
    }
  }
  const keyString = columns.join(", ");
  const valueString = values.map((value) => `'${value}'`).join(", ");

  return {
    columns: keyString,
    values: valueString,
  };
};

const sendResponse = (res, status, success, message, data = null) => {
  const response = {success, message};
  if (data !== null) {
    response.data = data;
  }
  return res.status(status).json(response);
};

const parseJsonFromString = (obj) => {
  for (const prop in obj) {
    if (typeof obj[prop] === "string") {
      try {
        obj[prop] = JSON.parse(obj[prop]);
      } catch (error) {}
    } else if (typeof obj[prop] === "object") {
      parseJsonFromString(obj[prop]);
    }
  }
};

const parseJson = (result) => {
  result.forEach((item) => {
    parseJsonFromString(item);
  });
  return result;
};

function getDatesWithDays(dates, month, year) {
  const datesWithDays = dates.map((date) => {
    const dayDate = new Date(year, month - 1, parseInt(date)); // Month is 0-indexed
    const dayName = dayDate.toLocaleDateString("en-US", {weekday: "long"});
    return {day: dayName, date: date};
  });
  return datesWithDays;
}

function generatePassword() {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789$@&";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

const modifyResponse = (responseArray, img_folder) => {
  return responseArray.map((response) => {
    let responseObj = response.toObject();

    if (
      responseObj.createdBy &&
      responseObj.createdBy.profilePicture &&
      !responseObj.createdBy.profilePicture.startsWith(base_url)
    ) {
      responseObj.createdBy.profilePicture = `${base_url}public/data/profile/${responseObj.createdBy._id}/${responseObj.createdBy.profilePicture}`;
    }

    responseObj?.reviews &&
      responseObj?.reviews.length > 0 &&
      responseObj?.reviews.forEach((review) => {
        if (
          review.user &&
          review.user.profilePicture &&
          !review.user.profilePicture.startsWith(base_url)
        ) {
          review.user.profilePicture = `${base_url}public/data/profile/${review.user._id}/${review.user.profilePicture}`;
        }
      });

    if (responseObj.images && responseObj.images.length > 0) {
      responseObj.images = responseObj.images.map((img) => {
        return `${base_url}public/data/${img_folder}/${responseObj._id}/${img}`;
      });
    }
    return responseObj;
  });
};

module.exports = {
  formatDate,
  filterDataValues,
  base_url,
  capitalizeStr,
  trimStr,
  generateInsertQueryValues,
  formatArray,
  front_base_url,
  sendResponse,
  parseJson,
  getDatesWithDays,
  generatePassword,
  modifyResponse,
};
