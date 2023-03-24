const addUser = async (user, socket) => {
  const index = global.onlineUsers.findIndex((user2) => {
    return user2.user == user;
  });
  if (index == -1) {
    global.onlineUsers.push({ user, socket, date: Date.now() });
  } else {
    global.onlineUsers[index].socket = socket;
  }
};

const removeUser = async (socket) => {
  const removedUser = global.onlineUsers.find((user) => {
    return user.socket == socket;
  });
  global.onlineUsers = global.onlineUsers.filter((user) => {
    return user.socket !== socket;
  });
  console.log("removed user", removedUser);
};

const sendMessageHelper = async (user, message, count) => {
  try {
    global.onlineUsers.forEach((user2) => {
      if (user2.user == user) {
        global.io
          .to(user2.socket)
          .emit("newMessage", { message: message, count: count });
      }
    });
  } catch (error) {
    console.log(error);
  }
};
module.exports = {
  addUser,
  removeUser,
  sendMessageHelper,
};
