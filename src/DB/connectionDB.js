import mongoose from "mongoose";

export default async function connectionDB() {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/saraha_app", {
      serverSelectionTimeoutMS: 5000,
    });
    console.log("DB connected successfully......😊");
  } catch (error) {
    console.log("DB connected failed........😒");
  }
}
