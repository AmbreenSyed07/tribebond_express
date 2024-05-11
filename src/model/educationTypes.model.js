const mongoose = require("mongoose");
const { Schema } = mongoose;

const educationTypeSchema = new Schema({
  typeName: { type: String, required: true },
  description: String, // Optional description of what each type entails
});

const EducationType = mongoose.model("EducationType", educationTypeSchema);

module.exports = EducationType;

