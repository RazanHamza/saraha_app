import joi from "joi";
import { generalRules } from "../../common/utils/generalRules.js";

export const signUpShema = {
  body: joi
    .object({
      fName: joi.string().alphanum().min(3).max(100).required().messages({
        "any.required": "first name is required",
        "string.min": "first name must be at least 3 characters",
      }),
      lName: joi.string().required(),
      email: generalRules.email.required(),
      phone: joi.string().required(),
      password: generalRules.password.required(),
      cpassword: joi
        .string()
        .valid(joi.ref("password"))
        .messages({ "any.only": "password and confirm password must match" })
        .required(),
      age: joi.number().required(),
      gender: joi.string().valid("male", "female"),
      isConfirmed:joi.boolean()
      // flag:joi.boolean().falsy(0,"false","no").truthy(1,"true","yes").sensitive(false),
    })
    // .options({presence:"required"})
    .with("password", "cpassword")
    .messages({
      any_required: "body is empty",
    }),
  // .or("email","phone"),
  // query: joi.object({
  //     flag: joi.boolean().required(),
  // })

  files: joi.object({
    attachment: joi.array().items(generalRules.file.required()).required(),
    attachments: joi.array().items(generalRules.file.required()).required(),
  }),
};

export const signInShema = {
  body: joi
    .object({
      email: joi
        .string()
        .email({
          minDomainSegments: 2,
          maxDomainSegments: 4,
          tlds: { allow: ["com", "net", "org", "yahoo"] },
        })
        .required(),
      password: joi.string().required(),
    })
    .required(),
};

export const refreshTokenShema = {
  headers: generalRules.token.required(),
};

export const shareProfileShema = {
  params: joi
    .object({
      id: generalRules.id.required(),
    })
    .required(),
};

export const updateProfileShema = {
  body: joi
    .object({
      fName: joi.string().alphanum().min(3).max(100),
      lName: joi.string(),
      phone: joi.string(),
      age: joi.number(),
      gender: joi.string().valid("male", "female"),
    }).required(),
};

export const updatePasswordShema = {
  body: joi
    .object({
      oldPassword: generalRules.password.required(),
      newPassword: generalRules.password.required(),
       cpassword: joi
        .string()
        .valid(joi.ref("newPassword"))
        .messages({ "any.only": "newPassword and confirm password must match" })
        .required(),
    
    }).required(),
};

export const confirmEmailSchema = {
    body: joi.object({
        email: joi.string().required(),
        otp: joi.string().pattern(/^[0-9]{6}$/).required()
    }).required()
}
