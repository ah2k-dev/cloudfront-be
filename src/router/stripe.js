const router = require("express").Router();
const stripe = require("../controllers/stripeController");

//get
router.route("/new").get(stripe.createAccount);
router.route("/link").post(stripe.linkAccount);

module.exports = router;
