const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create a schema for followers/following
const userRelationshipSchema = new Schema(
  {
    userId: { type: String },
  },
  { _id: false }
); // _id set to false to prevent Mongoose from creating an automatic _id for subdocuments

// Create the User schema
const userSchema = new Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    gender: { type: String, required: true },
    city: String,
    religion: String,
    profilePicture: String, // This could be a URL to the image
    longitude: Number,
    latitude: Number,
    followers: [userRelationshipSchema],
    following: [userRelationshipSchema],
  },
  {
    timestamps: true, // Enable automatic timestamps for createdAt and updatedAt
  }
);

// Create the model from the schema
const User = mongoose.model("User", userSchema);

module.exports = User;
