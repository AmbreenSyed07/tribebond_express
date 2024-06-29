const emailRegex =
  /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;

const isNotEmpty = (value) => {
  if (!value) {
    return false;
  }
  if (value.toString().trim() === "") {
    return false;
  }
  return true;
};

const isID = (value) => {
  if (!value) {
    return false;
  }
  if (value.toString().trim() === "") {
    return false;
  }
  if (Number(value) <= 0) {
    return false;
  }
  return true;
};

const isEmail = (value) => {
  if (!value) {
    return false;
  }
  if (value.toString().trim() === "") {
    return false;
  }
  if (emailRegex.test(value) === false) {
    return false;
  }
  return true;
};

const isPhoneNo = (value) => {
  if (!value) {
    return false;
  }
  if (value.toString().trim() === "") {
    return false;
  }
  if (value.toString().trim().length != 10) {
    return false;
  }
  return true;
};

const isWebsite = (value) => {
  if (!value) {
    return false;
  }
  if (value.toString().trim() === "") {
    return false;
  }
  return true;
};

const isPassword = (value) => {
  if (!value.toString()) {
    return false;
  }
  if (value.toString().trim() === "") {
    return false;
  }
  if (value.toString().trim().length < 6) {
    return false;
  }
  return true;
};

function isPrice(value) {
  if (!value) {
    return false;
  }
  if (value.toString().trim() === "") {
    return false;
  }
  if (typeof parseFloat(value) !== "number") {
    return false;
  }
  if (parseFloat(value) < 0) {
    return false;
  }
  const decimalPlaces = value.toString().split(".")[1];
  if (decimalPlaces && decimalPlaces.length > 2) {
    return false;
  }
  return true;
}

module.exports = {
  isNotEmpty,
  isPassword,
  isPhoneNo,
  isWebsite,
  isEmail,
  isID,
  isPrice,
};
