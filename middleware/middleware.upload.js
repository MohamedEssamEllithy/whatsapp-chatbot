import multer from "multer";
import path from "path";
import fs from "fs/promises"; // Import fs.promises instead of node:fs/promises
import replyModel from "../Database/Schema/replySchema.js";

let fileName;

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(path.resolve(
        "../whatsappbot/media"
      )));
  },
  filename: function (req, file, cb) {
    fileName =  file.originalname;
    cb(null, fileName);
  },
});
const uploadMedia = multer({ storage }).single("media");

const uploadingMediaMW =  (req, res, next) => {
  const newUploadMediaInstance = uploadMedia;
  newUploadMediaInstance(req, res, async function (err) {
    try {
      console.log({ fileName });
      const fileFounded = await replyModel.findOne({message:fileName})
      console.log(fileFounded);
     if (fileFounded){
       const filePath = path.resolve(`../whatsappbot/media/${fileName}`);
       console.log(filePath);
       await fs.unlink(filePath); 
       console.log("Successfully deleted filePath");
      }} catch (err) {
        console.error("Error deleting file:", err);
      
    }
    if (err instanceof multer.MulterError) {
      return res.status(500).json({ error: err.message });
    }
    next();
  });
};

export { uploadingMediaMW, fileName };
