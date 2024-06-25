const { isAuthenticated } = require("../middleware/auth");
const user = require("../controllers/userController");
const router = require("express").Router();

// get
router.route("/").get(isAuthenticated, user.getProfile);
router.route("/investors").post(isAuthenticated, user.getAllInvestors);
router.route("/creators").post(isAuthenticated, user.getAllCreators);
router.route("/investor/:id").get(isAuthenticated, user.getInvestorProfile);
router.route("/creator/:id").get(isAuthenticated, user.getCreatorProfile);
router
  .route("/featured-creators")
  .get(isAuthenticated, user.getFeaturedCreators);
router.route("/featured-investors").get(user.getFeaturedInvestors);

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

// dashboard apis
router.route("/creator-stats").get(isAuthenticated, user.creatorStats);
router.route("/investor-stats").get(isAuthenticated, user.investorDetail);
router.route("/creator-graph").post(isAuthenticated, user.generateCreatorGraph);
router
  .route("/investor-graph")
  .post(isAuthenticated, user.generateInvestorGraph);

router.route("/featured").get(isAuthenticated, user.fetchFeaturedUsers);

module.exports = router;
