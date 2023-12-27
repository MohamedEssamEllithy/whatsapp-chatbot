import replyModel from "../../Database/Schema/replySchema.js";
import { fileNameinstance as filename } from "../../middleware/middleware.upload.js";

async function addReply(req, res) {
  try {
    const flag = await replyModel.findOne({
      reply: req.body.reply,
      userId: req.body.userId,
    });

    if (flag) {
      res.json({
        message: "This reply exists before , write unique reply",
      });
      return;
    }
    if (!filename) {
      const messagesToInsert = req.body.message 
      const reply = await replyModel.insertMany([
        { ...req.body, message: messagesToInsert },
      ]);

      res.json({ message: "reply added", reply });
    } else {
         const PDFRegex =
           /\.(PDF|DOCX|DOC|XLS|XLSX|PPT|PPTX|TXT|RTF|ODS|ODP|ODT|CSV)$/i;
         const imageRegex =
           /\.(PNG|JPEG|JPG|GIF|TIFF|TIF|BMP|SVG|WEBP|ICO|RAW|PSD|EPS|AI|avif|heif|heic|pdn)$/i;
         const VideoRegex = /\.(MP4|AVI|MKV|WMV|MOV|FLV|MPEG|WEBM|OGV|MPG)$/i;
         if(PDFRegex.test(filename)||imageRegex.test(filename)||VideoRegex.test(filename) ){

           const reply = await replyModel.insertMany([
             {
               reply: filename,
               message: req.body.message.toLowerCase(),
               userId: req.body.userId,
              },
            ]);
            res.status(200).json({ message: "media uploaded" });
          }else{
            res.json({ message: "media cann't uploaded" });
          }
        }
  } catch (error) {
    res.json({ message: "error", error });
  }
}

async function updateReply(req, res) {
  try {
    const { reply, message, userId } = req.body;

    if (!message) {
      res.json({ message: " Enter your message" });
    } else {
      const updatedReply = await replyModel.findOneAndUpdate(
        { message: message.toLowerCase(), userId },
        { reply },
        { new: true }
      );
      if (!updatedReply) {
        res.json({ message: "message not found" });
      }
      res.json({ message: "Reply updated", updatedReply });
    }
  } catch (error) {
    res.json({ message: "error", error });
  }
}

async function getAllreplies(req, res) {
  try {
    const { userId } = req.body;
    const allreplies = await replyModel.find({ userId });
    if (allreplies) {
      res.json({ message: "All replies", allreplies });
    } else {
      res.json({ message: " No replies founded" });
    }
  } catch (error) {
    res.json({ message: "error", error });
  }
}

export { addReply, updateReply, getAllreplies };
