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
router.route("/getLive").post(campaign.getLive);
router.route("/getCompleted").post(campaign.getCompleted);

router
  .route("/request-payout/:id")
  .post(isAuthenticated, campaign.requestPayout);
router
  .route("/getRequestedPayoutCampaigns")
  .post(isAuthenticated, creatorAuth, campaign.getRequestedPayoutCampaigns);

router.route("/save-fav/:id").get(isAuthenticated, campaign.saveFavCampaigns);

router
  .route("/getFavCampaigns")
  .post(isAuthenticated, campaign.getFavCampaigns);

router.route("/unsave-fav").post(isAuthenticated, campaign.unsaveFavCampaigns);
// new
router
  .route("/completed/:creatorId")
  .get(isAuthenticated, campaign.fetchCompletedCampaigns);

module.exports = router;
