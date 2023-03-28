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

// investors
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
router
  .route("/getCreators")
  .post(isAuthenticated, adminAuth, admin.getCreators);
router
  .route("/updateCreatorProfile")
  .put(isAuthenticated, adminAuth, admin.updateCreator);
router
  .route("/deleteCreator/:id")
  .delete(isAuthenticated, adminAuth, admin.deleteCreator);

router.route('/dashboard').post(isAuthenticated, adminAuth, admin.dashboard)

module.exports = router;
