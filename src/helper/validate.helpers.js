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

// function isPrice(value) {
//   if (!value) {
//     console.log("1");

//     return false;
//   }
//   if (value.toString().trim() === "") {
//     console.log("2");

//     return false;
//   }
//   // console.log(typeof parseFloat(value), parseFloat(value));
//   if (typeof parseFloat(value) !== "number") {
//     console.log("3");

//     return false;
//   }
//   if (value < 0) {
//     console.log("4");

//     return false;
//   }
//   const decimalPlaces = value.toString().split(".")[1];
//   if (
//     (decimalPlaces && decimalPlaces.length > 2) ||
//     (decimalPlaces && typeof parseFloat(decimalPlaces) !== "number")
//   ) {
//     console.log("5");
//     return false;
//   }
//   return true;
// }

function isPrice(value) {
  // Check if the value is empty or null
  if (!value) {
    console.log("1");
    return false;
  }

  // Convert the value to a string and trim any whitespace
  const trimmedValue = value.toString().trim();

  // Check if the trimmed value is an empty string
  if (trimmedValue === "") {
    console.log("2");
    return false;
  }

  // Regular expression to check for valid price format
  const priceRegex = /^\d+(\.\d{1,2})?$/;

  // Check if the value matches the price format
  if (!priceRegex.test(trimmedValue)) {
    console.log("3");
    return false;
  }

  // Convert the value to a number and check if it is non-negative
  const numberValue = parseFloat(trimmedValue);
  if (numberValue < 0) {
    console.log("4");
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
