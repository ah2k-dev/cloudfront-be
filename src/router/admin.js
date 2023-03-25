const router = require("express").Router();
const admin = require("../controllers/adminController");
const campaign = require("../controllers/campaignController");
const { isAuthenticated, adminAuth } = require("../middleware/auth");

router
  .route("/approveCampaign/:id")
  .put(isAuthenticated, adminAuth, admin.approveCampaign);
router
  .route("/getCampaigns")
  .post(isAuthenticated, adminAuth, admin.getCampaigns);

module.exports = router;
