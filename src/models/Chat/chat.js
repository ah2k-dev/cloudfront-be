const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const chatSchema = new Schema({
  users: [
    {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
  ],
  lastMessage: {
    type: Schema.Types.ObjectId,
    ref: "message",
  },
  unSeenCount: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

const Chat = mongoose.model("chat", chatSchema);
module.exports = Chat;
