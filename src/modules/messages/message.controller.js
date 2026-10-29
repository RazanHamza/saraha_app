import { Router } from "express";
import * as US from "./message.service.js";
import { authentication } from "../../common/middleware/authentication.js";
import { validation } from "../../common/middleware/validation.js";
import * as MV from "./message.validation.js";
import { multerLocal } from "../../common/middleware/multer.js";
import { Multer_Enum } from "../../common/enum/multer.enum.js";

const messageRouter = Router();

messageRouter.post(
  "/crearte_message",
  multerLocal({
    customPath: "messages",
    customType: Multer_Enum.images,
  }).array("attachments", 3),
  authentication,
  validation(MV.createMessageSchema),
  US.createMessage,
);
messageRouter.get("/:userId", authentication, US.getMessages);

messageRouter.get("/message/:id", authentication, US.getMessageById);

messageRouter.delete("/:id", authentication, US.deleteMessage);

export default messageRouter;
