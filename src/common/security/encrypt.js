import crypto from "node:crypto";

// const ENCRYPTION_KEY =crypto.randomBytes(32); // Must be 256 bits علشان تمشى مع نوع ال algorithm اللي احنا مستخدمينه
const  ENCRYPTION_KEY =Buffer.from("12345678901234567890123456789012"); // علشان اضمن ان ال encruption يكون ثابت فى كل مرة و مش يتغير
const IV_LENGTH = 16;

export function Encrypt(plainText) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv("aes-256-cbc", ENCRYPTION_KEY, iv);
  let encrypted = cipher.update(plainText, "utf8", "hex");
  encrypted += cipher.final("hex");//علشان اكمل ال block اللى انا شغال عليه و اخليه يخلص
  return iv.toString("hex") + ":" + encrypted;
  //اعرفه الحاجه الى انا ذودتها علشان تتعرف وقت ال decode
  //وكمان علشان يبقى توقعها صعب بالنسبه للناس اللى عايزه تكسر ال encryption "attackers"
  
}

export function Decrypt(text) {
  const [ivHex, encryptedText] = text.split(":");
  const iv = Buffer.from(ivHex, "hex");
  const decipher = crypto.createDecipheriv("aes-256-cbc", ENCRYPTION_KEY, iv);
  let decrypted = decipher.update(encryptedText, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}
