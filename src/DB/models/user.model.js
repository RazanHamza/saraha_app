import mongoose from "mongoose";
import { genderEnum, providerEnum, roleEnum } from "../../common/enum/user.enum.js";
const userSchema = new mongoose.Schema(
  {
    fName: {
      type: String,
      required: true,
      trim: true,
      minLength: 2,
      maxLength: 15,
    },
    lName: {
      type: String,
      required: true,
      trim: true,
      minLength: 2,
      maxLength: 15,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required:function(){
        return this.provider === providerEnum.system? true : false 
      },
      trim: true,
    },
    age: {
      type: Number,
      required:function(){
        return this.provider === providerEnum.system? true : false 
      },
      min: 20,
      max: 60,
    },
    gender: {
      type: String,
      enum: Object.values(genderEnum),
      default:genderEnum.male
      
    },
    profileImage: {
      type: String,
    },
    coverImage: [String],
    phone: {
      type: String,
    },
    provider: {
      type: String,
      enum: Object.values(providerEnum),
      default: providerEnum.system,

    },
    changeCredentialAt:Date
    ,
     role: {
      type: String,
      enum: Object.values(roleEnum),
      default: roleEnum.user,
    },
    isConfirmed: {
      type: Boolean
    },
  },
  {
    timestamps: true,
    strict: true,
    strictQuery: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);
const userModel = mongoose.models.User || mongoose.model("users", userSchema);
export default userModel;
