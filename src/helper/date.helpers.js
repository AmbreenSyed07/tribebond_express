/** @format */

function padDate(inputDate) {
  // Split the date string by the dash separator
  const parts = inputDate.split("-");

  // Check the structure of the input date to determine the format
  if (parts[0].length === 4) {
    // Format is YYYY-M-D
    let year = parts[0];
    let month = parts[1].length === 1 ? "0" + parts[1] : parts[1];
    let day = parts[2].length === 1 ? "0" + parts[2] : parts[2];
    return `${year}-${month}-${day}`;
  } else {
    // Format is M-D-YYYY
    let month = parts[0].length === 1 ? "0" + parts[0] : parts[0];
    let day = parts[1].length === 1 ? "0" + parts[1] : parts[1];
    let year = parts[2];
    return `${month}-${day}-${year}`;
  }
}


const getCurrentDateAndTime = (
  indiaTime = new Date().toLocaleString("en-US", {
    timeZone: "Asia/Kolkata",
    hour12: false,
  }),
  format = "yyyy-mm-dd h:i:s"
) => {
  const newDateTime = formatDate(format, new Date(indiaTime));
  return newDateTime;
};

module.exports = { padDate, getCurrentDateAndTime };
