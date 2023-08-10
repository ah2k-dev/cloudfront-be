const router = require("express").Router();
const {
  isAuthenticated,
  creatorAuth,
  investorAuth,
} = require("../middleware/auth");
const campaign = require("../controllers/campaignController.js");

router.route("/create").post(isAuthenticated, creatorAuth, campaign.create);
router.route("/update").put(isAuthenticated, creatorAuth, campaign.update);
router.route("/getAll").post(campaign.getAll);
router.route("/getMine").post(isAuthenticated, creatorAuth, campaign.getMine);
router.route("/get/:id").get(campaign.get);
router
  .route("/getInvested")
  .post(isAuthenticated, investorAuth, campaign.getInvested);
router.route("/getFeatured").get(campaign.getFeatured);
router
  .route("/getEditorPicks")
  .get(isAuthenticated, investorAuth, campaign.getEditorPicks);

router.route("/invest").post(isAuthenticated, investorAuth, campaign.invest);
router.route("/getLive").get(campaign.getLive);
router.route("/getCompleted").get(campaign.getCompleted)

router.route("/request-payout/:id").post(isAuthenticated, campaign.requestPayout)
router.route("/getRequestedPayoutCampaigns").get(isAuthenticated, creatorAuth, campaign.getRequestedPayoutCampaigns)



module.exports = router;
