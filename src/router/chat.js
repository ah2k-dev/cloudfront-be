const router = require("express").Router();
const chat = require("../controllers/chatController");
const { isAuthenticated } = require("../middleware/auth");
//get
router.route("/getChats").get(isAuthenticated, chat.getChats);
router.route("/getChat/:id").get(isAuthenticated, chat.getChat);
//post
router.route("/createChat").post(isAuthenticated, chat.createChat);
router.route("/sendMessage").post(isAuthenticated, chat.sendMessage);
//put

module.exports = router;
