import jwt from "jsonwebtoken";
import userModel from "../../DB/models/user.model.js";
import { findOne } from "../../DB/service/db.service.js";
import { ttl } from "../../DB/service/redis.service.js";

export const authentication = async (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization) {
    throw new Error("token is required", { cause: 404 });
  }

  const decode = jwt.verify(authorization, "razan123");
  if (!decode?.id) {
    throw new Error("invalid token", { cause: 400 });
  }
  const user = await findOne({
    model: userModel,
    filter: { _id: decode.id },
  });
  if (!user) {
    throw new Error("email not exist or you can login on your signup", {
      cause: 400,
    });
  }
  if (user?.isConfirmed) throw new Error("user not confirmed yet");
  if (user?.changeCredentialAt?.getTime() > decode.iat * 1000) {
    throw new Error("token is expired you should login again ", { cause: 400 });
  }

  if ((await ttl(`revoke_token::${user._id}::${decode.jti}`)) > 0) {
    throw new Error("Invalid revoked token, you should login again");
  }
  req.user = user;
  req.decode = decode;
  next();
};
