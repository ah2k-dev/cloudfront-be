const router = require("express").Router();
const blog = require("../controllers/blog.js");
const {
  isAuthenticated,
  adminAuth,
  creatorAuth,
  investorAuth,
} = require("../middleware/auth.js");

router.get("/", blog.getBlog);
router.post("/", isAuthenticated, blog.postBlog);
router.post("/comment", isAuthenticated, blog.postComment);
router.post("/like", isAuthenticated, blog.postLike);
router.post("/blogCommnets", isAuthenticated, blog.fetchBlogComments);
// router.put('/:id', blog.putBlog);
router.delete('/:id', isAuthenticated, adminAuth, blog.deleteBlog);
router.delete('/comment/:id', isAuthenticated, blog.deleteComment)

module.exports = router;
