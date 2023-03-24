const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const messageSchema = new Schema({
  chat: {
    type: Schema.Types.ObjectId,
    ref: "chat",
    required: true,
  },
  sender: {
    type: Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  isRead: {
    type: Boolean,
    default: false,
  },
});

const Message = mongoose.model("message", messageSchema);
module.exports = Message;
