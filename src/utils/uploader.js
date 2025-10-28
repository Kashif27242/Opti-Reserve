import fs from "fs";
import path from "path";
import multer from "multer";

export const makeUploader = (folder = "uploads") => {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadPath = path.join("public", folder);
      fs.mkdirSync(uploadPath, { recursive: true });
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + "-" + file.originalname.replace(/\s+/g, "_"));
    },
  });

  return multer({ storage });
};



