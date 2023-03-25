const auth = require("./auth");
const user = require("./user");
const chat = require("./chat");
const campaign = require("./campaign");
const admin = require("./admin");

// module.exports = {
//   auth,
// };
const router = require("express").Router();

router.use("/auth", auth);
router.use("/user", user);
router.use("/chat", chat);
router.use("/campaign", campaign);
router.use("/admin", admin);

module.exports = router;
