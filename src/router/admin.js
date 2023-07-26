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

router.route('/releaseFunds/:id').get(isAuthenticated, adminAuth, admin.releaseFunds)

// investors
router.route("/createInvestor").post(admin.createInvestor);
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
router.post("/createCreator", admin.createCreator)
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
router.route("/dashboard").post(admin.dashboard);

router.route("/userStats").get(admin.userStats);

// web details
router
  .route("/webDetails/addUpdate")
  .post(isAuthenticated, adminAuth, admin.addUpdateWebDetails);
router.route("/weDetails/get").get(admin.getAllWebDetails);

module.exports = router;
