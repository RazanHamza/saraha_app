import joi from "joi";
import { Types } from "mongoose";

export const generalRules = {
id: joi.string().hex().length(24).custom((value, helper) => {
  return Types.ObjectId.isValid(value)
    ? value
    : helper.message("invalid id");
}),
  email: joi.string().email({
    minDomainSegments: 2,
    maxDomainSegments: 4,
    tlds: { allow: ["com", "net", "org", "yahoo"] },
  }),
  password: joi.string(),

  file: joi
    .object({
      fieldname: joi.string().required(),
      originalname: joi.string().required(),
      encoding: joi.string().required(),
      mimetype: joi.string().required(),
      path: joi.string(),
      destination: joi.string(),
      filename: joi.string(),
      size: joi.number().required(),
    })
    .required()
    .messages({
      "any.required": "file is required",
    }),
  token: joi.object({
    authorization: joi.string().required(),
    "content-type": joi.string(),
    "cache-control": joi.string(),
    "postman-token": joi.string(),
    "content-length": joi.string(),
    host: joi.string(),
    "user-agent": joi.string(),
    accept: joi.string(),
    "accept-encoding": joi.string(),
    connection: joi.string(),
  }),
};
