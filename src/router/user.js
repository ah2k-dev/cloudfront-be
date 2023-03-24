const { isAuthenticated } = require("../middleware/auth");
const user = require("../controllers/userController");
const router = require("express").Router();

// get
router.route("/").get(user.getProfile);
// post
router
  .route("/completeInvestorProfile")
  .post(isAuthenticated, user.completeInvestorProfile);
router
  .route("/completeCreatorProfile")
  .post(isAuthenticated, user.completeCreatorProfile);
// put
router.route("/updatePassword").put(isAuthenticated, user.updatePassword);
router
  .route("/updateInvestorProfile")
  .put(isAuthenticated, user.updateInvestorProfile);
router
  .route("/updateCreatorProfile")
  .put(isAuthenticated, user.updateCreatorProfile);

// delete

module.exports = router;
