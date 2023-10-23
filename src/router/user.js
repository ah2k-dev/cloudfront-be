const { isAuthenticated } = require("../middleware/auth");
const user = require("../controllers/userController");
const router = require("express").Router();

// get
router.route("/").get(isAuthenticated, user.getProfile);
// umer===> work
router.route("/investors").post(isAuthenticated, user.getAllInvestors);
router.route("/creators").post(isAuthenticated, user.getAllCreators);
router.route("/investor/:id").get(isAuthenticated, user.getInvestorProfile);
router.route("/creator/:id").get(isAuthenticated, user.getCreatorProfile);

// post
router
  .route("/completeInvestorProfile")
  .post(isAuthenticated, user.completeInvestorProfile);
router
  .route("/completeCreatorProfile")
  .post(isAuthenticated, user.completeCreatorProfile);
router.route("/globalSearch").post(isAuthenticated, user.globalSearch);
// put
router.route("/updatePassword").put(isAuthenticated, user.updatePassword);
router
  .route("/updateInvestorProfile")
  .put(isAuthenticated, user.updateInvestorProfile);
router
  .route("/updateCreatorProfile")
  .put(isAuthenticated, user.updateCreatorProfile);

router.route("/userStats", isAuthenticated, user.userStats);

router.route("/transactions").post(isAuthenticated, user.getTransactions);

// delete

module.exports = router;
