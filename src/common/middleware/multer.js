import multer from "multer";
import {resolve} from "node:path";
import { randomUUID } from "node:crypto";
import fs from "node:fs";

export const multerLocal = ({
  customPath = "General",
  customType = [],
}) => {
  const fullPath = `uploads/${customPath}`;

  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, fullPath);
    },

    filename: (req, file, cb) => {
      cb(null, randomUUID() + "__" + file.originalname);
    },
  });
  const fileFilter = (req, file, cb) => {
    console.log(file.mimetype);
      if (!customType.includes(file.mimetype)) { 
        cb(new Error("File type not supported"),false);
      }
        else {
          cb(null, true); 
      }}
    
  const upload = multer({
    storage,
    fileFilter
  });

  return upload;//متنساش
};