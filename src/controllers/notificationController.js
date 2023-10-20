const Notification = require("../models/Notification/notification");
const SuccessHandler = require("../utils/SuccessHandler");
const ErrorHandler = require("../utils/ErrorHandler");
// get all notif,
//  mark notfi as read,
// mark unread notifs  as true,
// unread notifiation of each user
const getAllNotifications = async (req, res) => {
  // #swagger.tags = ['notification']
  try {
    const notifications = await Notification.find({ user: req.user._id });
    return SuccessHandler(
      { message: "Fetched all notification", notifications },
      200,
      res
    );
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};
const markAllNotificationsAsRead = async (req, res) => {
  // #swagger.tags = ['notification']
  try {
    await Notification.updateMany(
      {
        user: req.user._id,
        isRead: false,
      },
      {
        $set: { isRead: true },
      }
    );
    return SuccessHandler({ message: "Notifications read" }, 200, res);
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};
const markNotificationAsRead = async (req, res) => {
  // #swagger.tags = ['notification']
  try {
    const { notificationId } = req.params;
    await Notification.findOneAndUpdate(
      {
        user: req.user._id,
        _id: notificationId,
        isRead: false,
      },
      {
        $set: { isRead: true },
      }
    );
    return SuccessHandler({ message: "Notification read" }, 200, res);
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};
const getUnreadNotifications = async (req, res) => {
  // #swagger.tags = ['notification']
  try {
    const unreadNotification = await Notification.find({
      user: req.user._id,
      isRead: false,
    });
    return SuccessHandler(
      { message: "Fetched unread Notifications", unreadNotification },
      200,
      res
    );
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};
module.exports = {
  getAllNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getUnreadNotifications,
};
