const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const blogSchema = new Schema(
  {
    statusText: { type: String, required: false },
    backgroundImage: {
      type: String, // URL to an image file
      required: false,
    },
    blogImage: [
      {
        type: String, // Assuming these are URLs to images
        required: false,
      },
    ],
    status: {
      type: Number,
      default: 1, // Default status set to 1
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Assuming 'User' is your user model
      required: true,
    },
  },
  {
    timestamps: true, // Enables createdAt and updatedAt fields automatically
    collation: { locale: "en", strength: 2 },
  }
);

const Blog = mongoose.model("Blog", blogSchema);

module.exports = Blog;