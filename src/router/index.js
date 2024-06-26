const auth = require("./auth");
const user = require("./user");
const chat = require("./chat");
const campaign = require("./campaign");
const admin = require("./admin");
const uploader = require("./uploader");
const blog = require("./blog");
const contact = require("./contact");
const notification = require("./notification");
const stripe = require("./stripe");
// module.exports = {
//   auth,
// };
const router = require("express").Router();

router.use("/auth", auth);
router.use("/user", user);
router.use("/chat", chat);
router.use("/campaign", campaign);
router.use("/admin", admin);
router.use("/uploader", uploader);
router.use("/blog", blog);
router.use("/contact", contact);
router.use("/notification", notification);
router.use("/stripe", stripe);

module.exports = router;
