const router = require("express").Router();
const notification = require("../controllers/notificationController");
const { isAuthenticated } = require("../middleware/auth");
//get
router.route("/getNotifications");
 .get(isAuthenticated, notification.getAllNotifications);
router
  .route("/getUnreadNotifications")
  .get(isAuthenticated, notification.getUnreadNotifications);
//put
router
  .route("/markAllNotificationsAsRead")
  .put(isAuthenticated, notification.markAllNotificationsAsRead);
router
  .route("/markNotificationAsRead/:notificationId")
  .put(isAuthenticated, notification.markNotificationAsRead);

module.exports = router;
