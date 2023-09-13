const router = require("express").Router();
const blog = require("../controllers/blog.js");
const {
  isAuthenticated,
  adminAuth,
  creatorAuth,
  investorAuth,
} = require("../middleware/auth.js");

router.post("/getAll", blog.getBlog);
router.post("/", isAuthenticated, blog.postBlog);
router.post("/comment", isAuthenticated, blog.postComment);
router.post("/like", isAuthenticated, blog.postLike);
router.post("/blogCommnets", blog.fetchBlogComments);
router.post("/blogById/:id", blog.getBlogById);
router.post("/blogLikes/:id", blog.fetchBlogLikes);
// router.put('/:id', blog.putBlog);
router.delete("/:id", isAuthenticated, adminAuth, blog.deleteBlog);
router.delete("/comment/:id", isAuthenticated, blog.deleteComment);
// get
router.get("/categoryCount", blog.categoryCount);
router.get("/mostLiked", blog.mostLiked);

module.exports = router;
