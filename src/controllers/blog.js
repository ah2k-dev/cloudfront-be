const SuccessHandler = require("../utils/SuccessHandler");
const ErrorHandler = require("../utils/ErrorHandler");
const Blog = require("../models/User/blog");
const Comment = require("../models/User/blogComment");

const getBlog = async (req, res, next) => {
  // #swagger.tags = ['Blog'];
  try {
    const itemPerPage = Number(req.body.itemPerPage);
    const pageNumber = Number(req.body.page) || 1;
    const skipItems = (pageNumber - 1) * itemPerPage;
    // ✅ Filter
    const titleFilter = req.body.search
      ? {
          title: { $regex: req.body.search, $options: "i" },
        }
      : {};
    const categoryFilter = req.body.category
      ? { category: { $regex: req.body.category, $options: "i" } }
      : {};

    const blogs = await Blog.find({
      ...titleFilter,
      ...categoryFilter,
    })
      .sort({ date: -1 })
      .skip(skipItems)
      .limit(itemPerPage)
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
    await Blog.findByIdAndUpdate(
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
      const blogs = await Blog.findByIdAndUpdate(
        blogId,
        { $pull: { likes: req.user._id } },
        { new: true }
      );
      return SuccessHandler(
        { message: "Blog unliked successfully", blogs },
        200,
        res
      );
    }
    const blogs = await Blog.findByIdAndUpdate(
      blogId,
      { $push: { likes: req.user._id } },
      { new: true }
    );
    return SuccessHandler(
      { message: "Blog liked successfully", blogs },
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
    const itemPerPage = Number(req.body.itemPerPage);
    const pageNumber = Number(req.body.page) || 1;
    const skipItems = (pageNumber - 1) * itemPerPage;
    const { blogId } = req.body;
    const blog = await Blog.findById(blogId)
      .skip(skipItems)
      .limit(itemPerPage)
      .populate({
        path: "comments",
        options: { sort: { date: -1 } },
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

const fetchBlogLikes = async (req, res, next) => {
  // #swagger.tags = ['Blog'];
  try {
    const { id } = req.params;
    const blog = await Blog.findById(id);
    const likes = blog.likes;

    return SuccessHandler(
      { message: "Likes fetched Successfully", likes },
      200,
      res
    );
  } catch (error) {
    return ErrorHandler(error.message, 400, req, res);
  }
};

const deleteBlog = async (req, res, next) => {
  // #swagger.tags = ['Blog'];
  try {
    const { id } = req.params;
    const blog = await Blog.findByIdAndDelete(id);
    return SuccessHandler({ blog }, 200, res);
  } catch (error) {
    return ErrorHandler(error.message, 400, req, res);
  }
};

const deleteComment = async (req, res, next) => {
  // #swagger.tags = ['Blog'];
  try {
    const { id } = req.params;
    const comment = await Comment.findById(id);
    if (req.user.role !== "admin" && req.user._id !== comment.user) {
      return ErrorHandler("You can not delete this comment", 400, req, res);
    }
    await Comment.findByIdAndDelete(id);
    return SuccessHandler("Comment deleted", 200, res);
  } catch (error) {
    return ErrorHandler(error.message, 400, req, res);
  }
};

const getBlogById = async (req, res, next) => {
  // #swagger.tags = ['Blog'];
  try {
    const { id } = req.params;
    const blogs = await Blog.findById(id)
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

const categoryCount = async (req, res) => {
  // #swagger.tags = ['Blog'];
  try {
    const blogsCategory = await Blog.aggregate([
      {
        $group: {
          _id: "$category",
          total: { $sum: 1 },
        },
      },
      {
        $project: {
          total: 1,
          category: "$_id",
          _id: 0,
        },
      },
    ]);
    return SuccessHandler({ blogsCategory }, 200, res);
  } catch (error) {
    ErrorHandler(error.message, 500, req, res);
  }
};
const mostLiked = async (req, res) => {
  // #swagger.tags = ['Blog'];
  try {
    const liked = await Blog.aggregate([
      { $sort: { likes: -1 } },
      { $limit: 4 },
    ]);
    return SuccessHandler({ liked }, 200, res);
  } catch (error) {
    ErrorHandler(error.message, 500, req, res);
  }
};

module.exports = {
  getBlog,
  postBlog,
  postComment,
  postLike,
  fetchBlogComments,
  deleteBlog,
  deleteComment,
  getBlogById,
  fetchBlogLikes,
  categoryCount,
  mostLiked,
};
