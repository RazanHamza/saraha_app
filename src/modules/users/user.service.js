import * as dbService from "../../DB/service/db.service.js";
import { Encrypt, Decrypt } from "../../common/security/encrypt.js";
import { Hash, Compare } from "../../common/security/hash.js";
import userModel from "../../DB/models/user.model.js";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import { providerEnum } from "../../common/enum/user.enum.js";
import { setValue } from "../../DB/service/redis.service.js";
import { randomUUID } from "crypto";
import { generate_otp } from "../../common/service/sendEmail.js";
import { hashSync } from "bcryptjs";
import sendEmail from "../../common/service/sendEmail.js";
import { eventEmitter } from "../../common/utils/events.js";
import { getValue } from "../../DB/service/redis.service.js";
import { compareSync } from "bcryptjs";
import { ttl } from "../../DB/service/redis.service.js";
import { deleteKey } from "../../DB/service/redis.service.js";
import { incr } from "../../DB/service/redis.service.js";
const client = new OAuth2Client();

//=================signUp==========================
export const signUp = async (req, res, next) => {
  const { fName, lName, email, password, age, gender, phone } = req.body;
  if (await userModel.findOne({ email: email.toLowerCase() })) {
    throw new Error("email already exist");
  }

  const paths = [];
  for (const file of req.files.attachments) {
    paths.push(file.path);
  }

  const otp = await generate_otp();
  const otpHash = hashSync(otp, 12);

eventEmitter.emit("confirm_email", async () => {
  await sendEmail({
    to: email,
    subject: "💜 Confirm Your Email | Saraha",
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>

      <body style="margin:0; padding:0; background:#f6f3ff; font-family:Arial,sans-serif; color:#30205c;">

        <div style="max-width:600px; margin:30px auto; padding:20px;">

          <div style="background:#ffffff; border-radius:20px; overflow:hidden; text-align:center; box-shadow:0 8px 30px rgba(76,29,149,0.08);">

            <div style="padding:35px 20px 20px;">
              <h1 style="margin:0; color:#6d28d9; font-size:34px;">
                💜 Saraha
              </h1>
              <p style="margin:8px 0 0; color:#8b83a8; font-size:14px;">
                Share · Connect · Be You
              </p>
            </div>

            <div style="padding:15px 30px 35px;">

              <div style="font-size:55px; margin:10px 0 20px;">
                ✉️
              </div>

              <h2 style="font-size:27px; margin:0 0 18px; color:#32136b;">
                Confirm Your Email
              </h2>

              <p style="font-size:16px; line-height:1.8; color:#68617d; margin:0 0 25px;">
                Hi there! 👋<br />
                Welcome to Saraha! We're happy to have you here.
                Enter the verification code below to complete your registration.
              </p>

              <div style="background:#f3edff; border:1px solid #e4d5ff; border-radius:15px; padding:25px 15px; margin:0 auto 20px;">

                <p style="margin:0 0 12px; font-size:12px; letter-spacing:3px; color:#6d28d9; font-weight:bold;">
                  YOUR OTP CODE
                </p>

                <div style="font-size:36px; font-weight:bold; letter-spacing:8px; color:#7e22ce;">
                  ${otp}
                </div>

              </div>

              <p style="font-size:14px; color:#77708e; margin:0 0 25px;">
                ⏱ This code expires in 20 minutes.
              </p>

              <div style="height:1px; background:#eee7ff; margin:25px 0;"></div>

              <p style="font-size:13px; line-height:1.8; color:#77708e;">
                If you didn't create a Saraha account, you can safely ignore this email.
                Never share your verification code with anyone.
              </p>

              <p style="font-size:16px; color:#6d28d9; font-weight:bold; margin:25px 0 0;">
                — The Saraha Team 💜
              </p>

            </div>
          </div>

          <p style="text-align:center; font-size:12px; color:#9990b5; margin-top:22px;">
            Saraha · Share. Connect. Be You.
          </p>

        </div>

      </body>
      </html>
    `,
  });
});

  await setValue({
    key: `otp::${email}`,
    value: otpHash,
    ttl: 60 * 20,
  });
  await setValue({
    key: `otp::max::${email}`,
    value: 1,
    ttl: 60 * 5,
  });

  const user = await dbService.create({
    model: userModel,
    data: [
      {
        fName,
        lName,
        email,
        password: await Hash(password),
        age,
        gender,
        phone: Encrypt(phone),
        profileImage: req.files.attachment[0].path,
        coverImages: paths,
      },
    ],
  });

  console.log(res.model);
  return res.status(201).json({ message: "Done", user });
};
//=================signUpWithGmail==========================
export const signUpWithGmail = async (req, res, next) => {
  const { idToken } = req.body;

  const decoded = await client.verifyIdToken({
    idToken,
    audience:
      "839681196524-9mq8ndj42prvpp5eut2a2uce2216d3h9.apps.googleusercontent.com",
  });
  const { family_name, given_name, picture, email_verified, email } =
    decoded.getPayload();
  let user = await userModel.findOne({ email: email.toLowerCase() });
  if (!user) {
    user = await userModel.create({
      fName: given_name,
      lName: family_name,
      email,
      profilImage: picture,
      isConfirmed: email_verified,
      provider: "google",
    });
  }
  if (user.provider == "system") {
    throw new Error("you can login with system only", { cause: 400 });
  }

  const access_token = jwt.sign(
    { id: user._id, email: user.email },
    "razan123",
    {
      expiresIn: 60 * 60,
    },
  );
  const refresh_token = jwt.sign(
    { id: user._id, email: user.email },
    "ammar123",
  );
  return res
    .status(200)
    .json({ massage: "Done", tokens: { access_token, refresh_token } });
};
//=================signIn==========================
export const signIn = async (req, res, next) => {
  const { email, password } = req.body;
  const user = await dbService.findOne({
    model: userModel,
    filter: { email: email.toLowerCase(),
   
       provider: providerEnum.system },
  });

  if (!user) {
    throw new Error("email not exist or you can login on your signup", {
      cause: 400,
    });
  }
  // if(user.isconfirmed !== true){
  //     return res.status(404).json({message:"email not confirmed"})
  // }

  if (!(await Compare(password, user.password))) {
    throw new Error("invalid password");
  }
  const tokenId = randomUUID();
  const access_token = jwt.sign(
    { id: user._id, email: user.email },
    "razan123",
    {
      expiresIn: 60 * 5,
      audience: "http://localhost:4000",
      issuer: "http://localhost:3000",
      notBefore: 30,
      jwtid: tokenId,
    },
  );
  const refresh_token = jwt.sign(
    { id: user._id, email: user.email },
    "ammar123",
    {
      expiresIn: 60 * 60,
      jwtid: tokenId,
    },
  );
  return res
    .status(200)
    .json({ massage: "Done", tokens: { access_token, refresh_token } });
};
//=================getProfile==========================
export const getProfile = async (req, res, next) => {
  return res.status(200).json({ massage: "Done", user: req.user.toObject() });
};
//=================shareProfile==========================
export const shareProfile = async (req, res, next) => {
  const { id } = req.params;
  let user = await dbService.findById({
    model: userModel,
    id,
    options: { password: 0 },
  });
  if (!user) {
    throw new Error("user not exist", { cause: 400 });
  }
  user.phone = Decrypt(user.phone);
  return res.status(200).json({ massage: "Done", user });
};
//=================refreshToken==========================
export const refreshToken = async (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization) {
    throw new Error("token is required", { cause: 404 });
  }

  const decode = jwt.verify(authorization, "ammar123");
  if (!decode?.id) {
    throw new Error("invalid token", { cause: 400 });
  }
  const user = await dbService.findOne({
    model: userModel,
    filter: { _id: decode.id },
  });
  if (!user) {
    throw new Error("email not exist or you can login on your signup", {
      cause: 400,
    });
  }
  const access_token = jwt.sign(
    { id: user._id, email: user.email },
    "razan123",
    {
      expiresIn: 60 * 60,
      audience: "http://localhost:4000",
      issuer: "http://localhost:3000",
      notBefore: 30,
      noTimestamp: true,
    },
  );

  return res.status(200).json({ massage: "Done", access_token });
};
//=================updateProfile==========================
export const updateProfile = async (req, res, next) => {
  const { fName, lName, age, gender, phone } = req.body;

  let updateQuery = {};
  if (fName !== undefined) {
    updateQuery.fName = fName;
  }
  if (lName !== undefined) {
    updateQuery.lName = lName;
  }
  if (gender !== undefined) {
    updateQuery.gender = gender;
  }
  if (age !== undefined) {
    updateQuery.age = age;
  }
  if (phone !== undefined) {
    updateQuery.phone = Encrypt(phone);
  }
  let user = await dbService.findByIdAndUpdate({
    model: userModel,
    id: req.user._id,
    update: updateQuery,
  });

  return res.status(200).json({ massage: "Done", user });
};
//=================updatePassword==========================
export const updatePassword = async (req, res, next) => {
  const { oldPassword, newPassword } = req.body;

  if (!(await Compare(oldPassword, req.user.password))) {
    throw new Error("Invalid old password");
  }

  req.user.password = await Hash(newPassword);
  req.user.changeCredentialAt = new Date();

  await req.user.save();

  return res.status(200).json({ message: "Done" });
};
//=================logout==========================
export const logout = async (req, res, next) => {
  const { flag } = req.query;

  if (flag && flag == "all") {
    req.user.changeCredentialAt = new Date();
    await req.user.save();
    await dbService.deleteMany({
      model: revokeTokenModel,
      filter: { userId: req.user._id },
    });
  } else {
    const currentTime = Math.floor(Date.now() / 1000);
    const exp = req.decode?.exp;
    const jti = req.decode?.jti;

    if (!exp || !jti) {
      return res
        .status(400)
        .json({ message: "Invalid token data or token expired" });
    }

    console.log(exp - currentTime);

    await setValue({
      key: `revoke_token::${req.user._id}::${jti}`,
      value: `${jti}`,
      ttl: exp - currentTime,
    });
  }

  return res.status(200).json({ message: "Logged out successfully" });
};
//=================confirmEmail==========================
export const confirmEmail = async (req, res, next) => {
  const { email, otp } = req.body;

  const otpValue = await getValue(`otp::${email}`);
  if (!otpValue) {
    throw new Error("otp expire", { cause: 400 });
  }

  if (!compareSync(otp, otpValue)) {
    throw new Error("invalid otp", { cause: 400 });
  }

  const user = await dbService.findOneAndUpdate({
    model: userModel,
    filter: {
      email,
      isConfirmed: {$exists:false},
    },
    update: {
      isConfirmed:true,
    },
  });
  if (!user) {
    throw new Error("user not exist ", { cause: 400 });
  }
  await deleteKey(`otp::${email}`);
  return res.status(200).json({ massage: "Done", user });
};
// ==================== reSendOtp ====================
export const reSendOtp = async (req, res, next) => {
  const { email } = req.body;

  const blockTTL = await ttl(`otp::block::${email}`);

if (blockTTL < 0) {
    if (getValue(`otp::max::${email}`) >= 3) {
        await setValue({
            key: `otp::max::${email}`,
            value: 0,
            ttl: 60 * 5
        })
    }
}

  const cooldownTTL = await ttl(`otp::cooldown::${email}`);

  if (cooldownTTL > 0) {
    throw new Error(`You can resend OTP after ${cooldownTTL} seconds`);
  }

  const maxOpt = Number((await getValue(`otp::max::${email}`)) || 0);

  if (maxOpt >= 3) {
    await setValue({
      key: `otp::block::${email}`,
      value: "1",
      ttl: 60,
    });

    throw new Error("You have exceeded the maximum number of resend attempts");
  }

  const user = await dbService.findOne({
    model: userModel,
    filter: {
      email,
      isConfirmed: {$exists:false},
    },
  });

  if (!user) {
    throw new Error("User does not exist or is already confirmed");
  }

  const otp = await generate_otp();
  const otpHash = hashSync(otp, 12);

  await setValue({
    key: `otp::${email}`,
    value: otpHash,
    ttl: 60 * 20,
  });

  await setValue({
    key: `otp::cooldown::${email}`,
    value: "1",
    ttl: 60,
  });

  const newMaxOpt = maxOpt + 1;

  await setValue({
    key: `otp::max::${email}`,
    value: String(newMaxOpt),
    ttl: 60 * 20,
  });

 
eventEmitter.emit("confirm_email", async () => {
  await sendEmail({
    to: email,
    subject: "💜 Confirm Your Email | Saraha",
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>

      <body style="margin:0; padding:0; background:#f6f3ff; font-family:Arial,sans-serif; color:#30205c;">

        <div style="max-width:600px; margin:30px auto; padding:20px;">

          <div style="background:#ffffff; border-radius:20px; overflow:hidden; text-align:center; box-shadow:0 8px 30px rgba(76,29,149,0.08);">

            <div style="padding:35px 20px 20px;">
              <h1 style="margin:0; color:#6d28d9; font-size:34px;">
                💜 Saraha
              </h1>
              <p style="margin:8px 0 0; color:#8b83a8; font-size:14px;">
                Share · Connect · Be You
              </p>
            </div>

            <div style="padding:15px 30px 35px;">

              <div style="font-size:55px; margin:10px 0 20px;">
                ✉️
              </div>

              <h2 style="font-size:27px; margin:0 0 18px; color:#32136b;">
                Confirm Your Email
              </h2>

              <p style="font-size:16px; line-height:1.8; color:#68617d; margin:0 0 25px;">
                Hi there! 👋<br />
                Welcome to Saraha! We're happy to have you here.
                Enter the verification code below to complete your registration.
              </p>

              <div style="background:#f3edff; border:1px solid #e4d5ff; border-radius:15px; padding:25px 15px; margin:0 auto 20px;">

                <p style="margin:0 0 12px; font-size:12px; letter-spacing:3px; color:#6d28d9; font-weight:bold;">
                  YOUR OTP CODE
                </p>

                <div style="font-size:36px; font-weight:bold; letter-spacing:8px; color:#7e22ce;">
                  ${otp}
                </div>

              </div>

              <p style="font-size:14px; color:#77708e; margin:0 0 25px;">
                ⏱ This code expires in 20 minutes.
              </p>

              <div style="height:1px; background:#eee7ff; margin:25px 0;"></div>

              <p style="font-size:13px; line-height:1.8; color:#77708e;">
                If you didn't create a Saraha account, you can safely ignore this email.
                Never share your verification code with anyone.
              </p>

              <p style="font-size:16px; color:#6d28d9; font-weight:bold; margin:25px 0 0;">
                — The Saraha Team 💜
              </p>

            </div>
          </div>

          <p style="text-align:center; font-size:12px; color:#9990b5; margin-top:22px;">
            Saraha · Share. Connect. Be You.
          </p>

        </div>

      </body>
      </html>
    `,
  });
});


  return res.status(201).json({
    message: "OTP sent successfully",
    user,
  });
};
// ============ forgetPassword ============
export const forgetPassword = async (req, res, next) => {
    const { email } = req.query

    await SendEmailOtp({ email,isConfirmed:true })

    return res.status(200).json({ message: "Done" })
}

