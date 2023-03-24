const auth = require("./auth");
const user = require("./user");
const chat = require("./chat");

// module.exports = {
//   auth,
// };
const router = require("express").Router();

router.use("/auth", auth);
router.use("/user", user);
router.use("/chat", chat);

module.exports = router;
