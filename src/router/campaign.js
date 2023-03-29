const router = require("express").Router();
const {
  isAuthenticated,
  creatorAuth,
  investorAuth,
} = require("../middleware/auth");
const campaign = require("../controllers/campaignController.js");

router.route("/create").post(isAuthenticated, creatorAuth, campaign.create);
router.route("/update").put(isAuthenticated, creatorAuth, campaign.update);
router.route("/getAll").post(isAuthenticated, campaign.getAll);
router.route("/getMine").post(isAuthenticated, creatorAuth, campaign.getMine);
router
  .route("/getInvested")
  .post(isAuthenticated, investorAuth, campaign.getInvested);
router.route("/getFeatured").get(isAuthenticated, campaign.getFeatured);
router
  .route("/getEditorPicks")
  .get(isAuthenticated, investorAuth, campaign.getEditorPicks);

router.route("/invest").post(isAuthenticated, investorAuth, campaign.invest);

module.exports = router;
