const {
  educationTypes: initialEduTypes,
} = require("../constants/education-types.constants");
const { asyncHandler } = require("../helper/async-error.helper");
const EducationType = require("../model/educationTypes.model");

const seedDatabase = async () => {
  return asyncHandler(async () => {
    for (const eduType of initialEduTypes) {
      // Check if the EducationType already exists
      const existingType = await EducationType.findById(eduType._id);
      if (!existingType) {
        // If the EducationType does not exist, create it
        const newEducationType = new EducationType(eduType);
        await newEducationType.save();
        console.log(`Inserted: ${eduType.typeName}`);
      } else {
        console.log(`Exists: ${eduType.typeName}`);
      }
    }
  });
};

module.exports = { seedDatabase };
