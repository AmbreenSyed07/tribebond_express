const { asyncHandler } = require("../helper/async-error.helper");
const Chat = require("../model/chat.model");

const getChatsForUsers = async (info, userId) => {
  return asyncHandler(async () => {
    const chats = await Chat.find(info).lean();
    if (chats && chats.length > 0) {
      const chatsWithIsSender = chats.map((chat) => ({
        ...chat,
        isSender: chat.senderId.toString() === userId,
      }));
      return chatsWithIsSender;
    } else {
      return false;
    }
  });
};

module.exports = {
  getChatsForUsers,
};
