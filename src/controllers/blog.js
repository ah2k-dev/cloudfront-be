const SuccessHandler = require("../utils/SuccessHandler");
const ErrorHandler = require("../utils/ErrorHandler");
const Blog = require("../models/User/blog");
const Comment = require("../models/User/blogComment");

const getBlog = async (req, res, next) => {
  // #swagger.tags = ['Blog'];
  try {
    const blogs = await Blog.find({})
      .populate("author", "firstName lastName profilePic role")
      .populate({
        path: "comments",
        populate: {
          path: "user",
          select: "firstName lastName profilePic role",
        },
      });
    return SuccessHandler({ blogs }, 200, res);
  } catch (error) {
    return ErrorHandler(error.message, 400, req, res);
  }
};
const postBlog = async (req, res, next) => {
  // #swagger.tags = ['Blog'];
  try {
    const { title, category, tags, thumbnailImage, overview, detailedBlog } =
      req.body;
    const blog = new Blog({
      title,
      category,
      tags,
      thumbnailImage,
      overview,
      detailedBlog,
      author: req.user._id,
    });
    await blog.save();
    return SuccessHandler(
      { message: "Blog posted successfully", blog },
      200,
      res
    );
  } catch (error) {
    return ErrorHandler(error.message, 400, req, res);
  }
};
const postComment = async (req, res, next) => {
  // #swagger.tags = ['Blog'];
  try {
    const { comment, blogId } = req.body;
    const newComment = new Comment({
      comment,
      user: req.user._id,
    });
    await newComment.save();
    const blog = await Blog.findByIdAndUpdate(
      blogId,
      { $push: { comments: newComment._id } },
      { new: true }
    );
    return SuccessHandler(
      { message: "Comment posted successfully", newComment },
      200,
      res
    );
  } catch (error) {
    return ErrorHandler(error.message, 400, req, res);
  }
};
const postLike = async (req, res, next) => {
  // #swagger.tags = ['Blog'];
  try {
    const { blogId } = req.body;
    const blog = await Blog.findById(blogId);
    if (blog.likes.includes(req.user._id)) {
      const updatedBlog = await Blog.findByIdAndUpdate(
        blogId,
        { $pull: { likes: req.user._id } },
        { new: true }
      );
      return SuccessHandler(
        { message: "Blog unliked successfully", updatedBlog },
        200,
        res
      );
    }
    const updatedBlog = await Blog.findByIdAndUpdate(
      blogId,
      { $push: { likes: req.user._id } },
      { new: true }
    );
    return SuccessHandler(
      { message: "Blog liked successfully", updatedBlog },
      200,
      res
    );
  } catch (error) {
    return ErrorHandler(error.message, 400, req, res);
  }
};

const fetchBlogComments = async (req, res, next) => {
  // #swagger.tags = ['Blog'];
  try {
    const { blogId } = req.body;
    const blog = await Blog.findById(blogId).populate({
      path: "comments",
      populate: {
        path: "user",
        select: "firstName lastName profilePic role",
      },
    });
    return SuccessHandler({ blog }, 200, res);
  } catch (error) {
    return ErrorHandler(error.message, 400, req, res);
  }
};

module.exports = {
  getBlog,
  postBlog,
  postComment,
  postLike,
    fetchBlogComments,
};
