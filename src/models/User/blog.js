const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const blogSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: "user",
  },
  category: {
    type: String,
    required: true,
  },
  tags: {
    type: [String],
    required: true,
  },
  thumbnailImage: {
    type: String,
    required: true,
  },
  overview: {
    type: String,
    required: true,
  },
  detailedBlog: {
    type: String,
    required: true,
  },
  likes: {
    type: [Schema.Types.ObjectId],
    ref: "user",
  },
  comments: {
    type: [Schema.Types.ObjectId],
    ref: "comment",
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

const blog = mongoose.model("blog", blogSchema);
module.exports = blog;
