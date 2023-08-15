const router = require("express").Router();
const contact = require("../controllers/contactController.js");

router.route("/").post(contact.contactUs);
router.route("/").get(contact.getContactUs);

module.exports = router;