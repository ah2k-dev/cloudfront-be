const Notification = require("../models/Notification/notification");
const { sendNotificationHelper } = require("../functions/socketFunctions");
const sendNotification = async (title, text, user) => {
  const notif = await Notification.create({
    title,
    text,
    user,
  });
  sendNotificationHelper(user, notif);
};
module.exports = { sendNotification };
