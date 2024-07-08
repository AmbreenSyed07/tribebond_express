const { asyncErrorHandler } = require("../helper/async-error.helper");
const { sendResponse } = require("../helper/local.helpers");
const { getChatsForUsers } = require("../service/chat.service");

const displayChat = async (req, res) => {
  return asyncErrorHandler(async () => {
    const { senderId, receiverId, moduleId } = req.body;
    const { _id: userId } = req.tokenData;

    let chats = await getChatsForUsers(
      { senderId, receiverId, moduleId },
      userId
    );

    if (!chats) {
      return sendResponse(res, 400, false, "No chats between you yet.");
    } else {
      return sendResponse(res, 200, true, "Chats fetched successfully.", chats);
    }
  }, res);
};

module.exports = { displayChat };
