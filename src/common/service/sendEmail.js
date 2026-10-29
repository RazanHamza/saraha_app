import nodemailer from "nodemailer";
import { randomInt } from "crypto";
const sendEmail = async ({ to, subject, html, attachments } = {}) => {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: "kabbaskhaled116@gmail.com",
            pass: "rrmg emjm fsqf vxql"
        }
    })

    const info = await transporter.sendMail({
        from: '"razan" <kabbaskhaled116@gmail.com>',
        to,
        subject,
        html: html || "",
        attachments: attachments || []
    });
    return info.accepted.length > 0? true:false;

}
export const generate_otp=async()=>{
    return randomInt(100000,1000000).toString()

}

export default sendEmail;