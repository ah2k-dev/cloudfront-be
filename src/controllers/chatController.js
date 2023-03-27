const Chat = require("../models/Chat/chat");
const Message = require("../models/Chat/messages");
const creatorProfile = require("../models/User/creatorProfile");
const investorProfile = require("../models/User/investorProfile");
const ErrorHandler = require("../utils/ErrorHandler");
const SuccessHandler = require("../utils/SuccessHandler");

const getChats = async (req, res) => {
  // #swagger.tags = ['chat']
  try {
    const id = req.user._id;
    const chats = await Chat.find({
      users: { $in: [id] },
    })
      .populate("users", "name email")
      .populate("lastMessage", "message createdAt");
    if (!chats) {
      return ErrorHandler("No chats found", 404, req, res);
    } else {
      return SuccessHandler(
        {
          message: `${
            chats.length > 0
              ? "Chats fetched successfully"
              : "No chats found. Start one!"
          }`,
          chats,
        },
        200,
        res
      );
    }
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};
const getChat = async (req, res) => {
  // #swagger.tags = ['chat']
  try {
    const chat = await Chat.findById(req.params.id);
    if (!chat) {
      return ErrorHandler("Chat not found", 404, req, res);
    }
    const messages = await Message.find({ chat: chat._id });
    await Message.updateMany({ chat: chat._id }, { $set: { isRead: true } });
    await Chat.findOneAndUpdate(
      { _id: chat._id },
      { $set: { unSeenCount: 0 } }
    );
    return SuccessHandler(
      {
        message: "Chat fetched successfully",
        messages,
      },
      200,
      res
    );
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};
const createChat = async (req, res) => {
  // #swagger.tags = ['chat']
  try {
    const { users } = req.body;
    const investor = await investorProfile.findOne({
      investor: { $in: users },
    });
    const creator = await creatorProfile.findone({
      creator: { $in: users },
    });
    if (!creator.investors.includes(investor.investor)) {
      return ErrorHandler("Not Authenticated", 401, req, res);
    }
    const chat = await Chat.findOne({
      users: { $all: users },
    });
    if (chat) {
      return SuccessHandler(
        {
          message: "Chat already exists",
          chat,
        },
        200,
        res
      );
    } else {
      const newChat = new Chat({
        users,
        lastMessage: null,
      });
      await newChat.save();
      return SuccessHandler(
        {
          message: "Chat created successfully",
          newChat,
        },
        201,
        res
      );
    }
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};
const sendMessage = async (req, res) => {
  // #swagger.tags = ['chat']
  try {
    const { message, chatId } = req.body;
    const chat = await Chat.findById(chatId);
    const isNewChat = chat.lastMessage ? false : true;
    if (!chat) {
      return ErrorHandler("Chat not found", 404, req, res);
    }
    // let newChat = false;
    // if (chat.lastMessage !== null) {
    //   newChat = true;
    // }
    const newMessage = new Message({
      message,
      chat: chatId,
      sender: req.user._id,
    });
    await newMessage.save();
    await Chat.findOneAndUpdate(
      { _id: chatId },
      {
        $set: {
          lastMessage: newMessage._id,
          unSeenCount: chat.unSeenCount + 1,
        },
      }
    );
    // send message socket helper here
    await newMessage.populate("sender", "name email");
    const userToNotify = chat.users.filter(
      (user) => user.toString() !== req.user._id.toString()
    )[0];
    sendMessageHelper(userToNotify, {
      newMessage: newMessage,
      chat: chat,
      isNewChat,
    });
    return SuccessHandler(
      {
        message: "Message sent successfully",
        newMessage,
      },
      201,
      res
    );
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};
module.exports = {
  getChats,
  createChat,
  getChat,
  sendMessage,
};
