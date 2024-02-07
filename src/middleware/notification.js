const Notification = require("../models/Notification/notification");
const { sendNotificationHelper } = require("../functions/socketFunctions");
const sendNotification = async (title, text, user, generatedBy) => {
  const notif = await Notification.create({
    title,
    text,
    user,
    generatedBy,
  });
  sendNotificationHelper(user, notif);
};
module.exports = { sendNotification };
