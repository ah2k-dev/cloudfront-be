const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const notficationSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "user",
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);
const notification = mongoose.model("Notification", notficationSchema);
module.exports = notification;
