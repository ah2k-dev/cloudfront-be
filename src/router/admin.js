const router = require("express").Router();
const admin = require("../controllers/adminController");
const campaign = require("../controllers/campaignController");
const { isAuthenticated, adminAuth } = require("../middleware/auth");

// campaigns
router
  .route("/approveCampaign/:id")
  .put(isAuthenticated, adminAuth, admin.approveCampaign);
router
  .route("/rejectCampaign/:id")
  .put(isAuthenticated, adminAuth, admin.rejectCampaign);
router
  .route("/getCampaigns")
  .post(isAuthenticated, adminAuth, admin.getCampaigns);

router
  .route("/updateCampaign")
  .put(isAuthenticated, adminAuth, admin.editCampaign);
router
  .route("/deleteCampaign/:id")
  .delete(isAuthenticated, adminAuth, admin.deleteCampaign);

router
  .route("/releaseFunds/:id")
  .get(isAuthenticated, adminAuth, admin.releaseFunds);

router
  .route("/add-to-featured/:id")
  .get(isAuthenticated, adminAuth, admin.addToFeatured);

// investors
router
  .route("/createInvestor")
  .post(isAuthenticated, adminAuth, admin.createInvestor);
router
  .route("/getInvestors")
  .post(isAuthenticated, adminAuth, admin.getInvestors);
router
  .route("/updateInvestorProfile")
  .put(isAuthenticated, adminAuth, admin.updateInvestor);
router
  .route("/deleteInvestor/:id")
  .delete(isAuthenticated, adminAuth, admin.deleteInvestor);

// creators
router.post("/createCreator", isAuthenticated, adminAuth, admin.createCreator);
router
  .route("/getCreators")
  .post(isAuthenticated, adminAuth, admin.getCreators);
router
  .route("/updateCreatorProfile")
  .put(isAuthenticated, adminAuth, admin.updateCreator);
router
  .route("/deleteCreator/:id")
  .delete(isAuthenticated, adminAuth, admin.deleteCreator);

// dashboard
router.route("/dashboard").post(isAuthenticated, adminAuth, admin.dashboard);

router.route("/userStats").post(isAuthenticated, adminAuth, admin.userStats);

// web details
router
  .route("/webDetails/addUpdate")
  .post(isAuthenticated, adminAuth, admin.addUpdateWebDetails);
router.route("/weDetails/get").get(admin.getAllWebDetails);

// admin profile
router.route("/get-profile").get(isAuthenticated, adminAuth, admin.getProfile);
router
  .route("/update-profile")
  .put(isAuthenticated, adminAuth, admin.updateProfile);

// dashboard Api
router.route("/stats").get(isAuthenticated, adminAuth, admin.dashboardStats);
router.route("/graph").post(isAuthenticated, adminAuth, admin.generateGraph);

router
  .route("/feature-user/:id")
  .put(isAuthenticated, adminAuth, admin.toggleFeaturedStatus);

module.exports = router;
