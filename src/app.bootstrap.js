import connectionDB from "./DB/connectionDB.js";
import connectionRedis from "./DB/connection.redis.js";
import express from "express";
import cors from "cors";
const app = express();
const port = 3000;
import userRouter from "./modules/users/user.controller.js";
import { setValue } from "./DB/service/redis.service.js";
import messageRouter from './modules/messages/message.controller.js';


const bootstrap = async () => {

  app.use(cors({
    origin: "*",
  }));

  app.use(express.json());
  await connectionDB()
  await connectionRedis()
  app.get("/", (req, res) => {
    res.status(200).json({
      message: "Welcome on saraha_app.......❤️",
    });
  });
  app.use("/users", userRouter);
  app.use("/messages", messageRouter);
  app.use("{/*dummy}", (req, res, next) => {
    throw new Error(
      `Url:${req.originalUrl}With Method:${req.method} Not Found......💔`,
      { cause: 404 },
    );
  });

  app.use((err, req, res, next) => {
    console.log(err);
    res
      .status(err.cause || 500)
      .json({ message: err.message, stack: err.stack });
  });

  app.listen(port, () => {
    console.log(`app listening on port ${port}!`);
  });
};
export default bootstrap;
