const Notification = require("../models/Notification/notification");
const sendNotification = async (title, text, user) => {
  const notif = await Notification.create({
    title,
    text,
    user,
  });
  console.log("Notif: ", notif);
};
module.exports = { sendNotification };
