import * as dbService from "../../DB/service/db.service.js";
import userModel from "../../DB/models/user.model.js";
import messageModel from './../../DB/models/message.model.js';

// ============== createMessage ==============
export const createMessage = async (req, res, next) => {
  
  const { content, userId } = req.body;

  if (!content && !req.files.length) throw new Error("content is required");

  const userExist = await dbService.findById({
    model: userModel,
    id: userId,
  });
  if (!userExist) throw new Error("user not exist");

  let urls = [];
  if (req?.files?.length) {
    for (const file of req?.files) {
      urls.push(file.path);
    }
  }
  
const message = await messageModel.create({
  content: content,
  attachments: urls,
  userId: userId,
});    

  return res.status(201).json({ message: "Done", message });
};
// ==================== getMessages ====================
export const getMessages = async (req, res, next) => {
  const message = await dbService.findMany({
    model: messageModel,
    filter: { userId: req.params.userId },
  });

  return res.status(200).json({ message: "Donne", data: message});
};
//==================== getMessageById ====================
export const getMessageById = async (req, res, next) => {
  const message = await dbService.findOne({
    model: messageModel,
    filter: {
      _id: req.params.id,
      userId: req.user._id,
    },
  });

  return res.status(200).json({ message: "Donne", data: message });
};
//==================== deleteMessage ====================
export const deleteMessage = async (req, res, next) => {
  const message = await dbService.deleteOne({
    model: messageModel,
    filter: {
      _id: req.params.id,
      userId: req.user._id,
    },
  });

  if (message.deletedCount === 0) {
    return res.status(404).json({
      message: "Message not found",
    });
  }

  return res.status(200).json({
    message: "Message deleted successfully",
    data: message,
  });
};