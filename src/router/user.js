const { isAuthenticated } = require("../middleware/auth");
const user = require("../controllers/userController");
const router = require("express").Router();

// get
router.route("/").get(isAuthenticated, user.getProfile);
// post
router
  .route("/completeInvestorProfile")
  .post(isAuthenticated, user.completeInvestorProfile);
router
  .route("/completeCreatorProfile")
  .post(isAuthenticated, user.completeCreatorProfile);
router.route("/globalSearch").post(isAuthenticated, user.globalSearch)
// put
router.route("/updatePassword").put(isAuthenticated, user.updatePassword);
router
  .route("/updateInvestorProfile")
  .put(isAuthenticated, user.updateInvestorProfile);
router
  .route("/updateCreatorProfile")
  .put(isAuthenticated, user.updateCreatorProfile);

router
  .route("/userStats", isAuthenticated, user.userStats)

router.route("/transactions").get(isAuthenticated, user.getTransactions)

// delete

module.exports = router;
